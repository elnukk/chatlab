import { createServerClient } from '@/lib/supabase-server';
import { getProvider } from '@/lib/llm';
import { renderPrompt } from '@/lib/prompts/renderer';
import { getCorsHeaders } from '@/lib/utils/cors';

export async function OPTIONS(request) {
  const origin = request.headers.get('origin') || '';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request) {
  const origin = request.headers.get('origin') || '';

  try {
    const body = await request.json();
    const { experiment_id, participant_id, message, template_variables } = body;

    if (!experiment_id || !participant_id || !message) {
      return Response.json(
        { error: 'Missing required fields: experiment_id, participant_id, message' },
        { status: 400 }
      );
    }

    const sanitizedMessage = message.trim().slice(0, 10000);
    if (!sanitizedMessage) {
      return Response.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Load experiment
    const { data: experiment, error: expError } = await supabase
      .from('experiments')
      .select('*')
      .eq('id', experiment_id)
      .single();

    if (expError || !experiment) {
      return Response.json({ error: 'Experiment not found' }, { status: 404 });
    }

    if (experiment.status !== 'active') {
      return Response.json({ error: 'Experiment is not active' }, { status: 403 });
    }

    // 2. CORS check
    const corsHeaders = getCorsHeaders(experiment.allowed_origins, origin);

    // 3. Find or create participant
    let { data: participant } = await supabase
      .from('participants')
      .select('*')
      .eq('experiment_id', experiment_id)
      .eq('external_id', participant_id)
      .single();

    if (!participant) {
      const { data: newParticipant, error: createError } = await supabase
        .from('participants')
        .insert({
          experiment_id,
          external_id: participant_id,
          metadata: template_variables || {},
        })
        .select()
        .single();

      if (createError) {
        const { data: existing } = await supabase
          .from('participants')
          .select('*')
          .eq('experiment_id', experiment_id)
          .eq('external_id', participant_id)
          .single();
        participant = existing;
      } else {
        participant = newParticipant;
      }
    }

    if (!participant) {
      return Response.json({ error: 'Failed to create participant' }, { status: 500 });
    }

    // 4. Find or create conversation
    let { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('participant_id', participant.id)
      .single();

    if (!conversation) {
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          participant_id: participant.id,
          status: 'active',
        })
        .select()
        .single();

      if (convError) {
        const { data: existing } = await supabase
          .from('conversations')
          .select('*')
          .eq('participant_id', participant.id)
          .single();
        conversation = existing;
      } else {
        conversation = newConversation;
      }
    }

    if (!conversation) {
      return Response.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    if (conversation.status === 'completed') {
      return Response.json(
        { error: 'Conversation already completed', session_status: 'completed' },
        { status: 403, headers: corsHeaders }
      );
    }

    // 5. Check message limits
    const { data: existingMessages } = await supabase
      .from('messages')
      .select('role')
      .eq('conversation_id', conversation.id);

    const userMessageCount = (existingMessages || []).filter((m) => m.role === 'user').length;
    const maxMessages = experiment.max_messages;

    if (maxMessages && userMessageCount >= maxMessages) {
      return Response.json(
        {
          error: 'Message limit reached',
          session_status: 'completed',
          completion_message: experiment.completion_message,
        },
        { status: 403, headers: corsHeaders }
      );
    }

    // 6. Store user message
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      role: 'user',
      content: sanitizedMessage,
    });

    // 7. Render system prompt with template variables
    const vars = {
      ...(template_variables || {}),
      participant_id,
      experiment_id,
      message_count: userMessageCount,
    };

    const systemMessage = renderPrompt(experiment.system_prompt || 'You are a helpful assistant.', vars);

    // 8. Build conversation history
    const { data: allMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    const conversationHistory = (allMessages || [])
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));

    // 9. Call LLM
    const provider = getProvider(experiment.llm_provider);
    const llmResponse = await provider.chat({
      model: experiment.llm_model,
      systemMessage,
      messages: conversationHistory,
      temperature: experiment.llm_temperature,
      maxTokens: experiment.llm_max_tokens,
      apiKey: experiment.llm_api_key,
    });

    // 10. Store assistant message
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      role: 'assistant',
      content: llmResponse.content,
      token_count: llmResponse.tokenUsage
        ? llmResponse.tokenUsage.input + llmResponse.tokenUsage.output
        : null,
    });

    // 11. Check if conversation should be completed
    let sessionStatus = 'active';
    const newUserCount = userMessageCount + 1;

    if (maxMessages && newUserCount >= maxMessages) {
      await supabase
        .from('conversations')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', conversation.id);
      sessionStatus = 'completed';
    }

    return Response.json(
      {
        message: llmResponse.content,
        session_status: sessionStatus,
        messages_remaining: maxMessages ? maxMessages - newUserCount : null,
        completion_message: sessionStatus === 'completed' ? experiment.completion_message : undefined,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
