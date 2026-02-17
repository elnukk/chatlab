import { createServerClient } from '@/lib/supabase-server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const experimentId = searchParams.get('experiment_id');
  const participantId = searchParams.get('participant_id');

  if (!experimentId || !participantId) {
    return Response.json(
      { error: 'Missing required parameters: experiment_id, participant_id' },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Load experiment
  const { data: experiment, error: expError } = await supabase
    .from('experiments')
    .select('*')
    .eq('id', experimentId)
    .single();

  if (expError || !experiment) {
    return Response.json({ error: 'Experiment not found' }, { status: 404 });
  }

  if (experiment.status !== 'active') {
    return Response.json({ error: 'Experiment is not active' }, { status: 403 });
  }

  // Look up participant
  const { data: participant } = await supabase
    .from('participants')
    .select('*')
    .eq('experiment_id', experimentId)
    .eq('external_id', participantId)
    .single();

  if (!participant) {
    // No participant yet — return seed message if configured
    const messages = experiment.seed_message
      ? [{ role: 'assistant', content: experiment.seed_message }]
      : [];

    return Response.json({
      status: 'active',
      messages,
      messages_sent: 0,
      messages_remaining: experiment.max_messages || null,
      completion_message: experiment.completion_message,
    });
  }

  // Look up conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('participant_id', participant.id)
    .single();

  if (!conversation) {
    // Participant exists but no conversation yet
    const messages = experiment.seed_message
      ? [{ role: 'assistant', content: experiment.seed_message }]
      : [];

    return Response.json({
      status: 'active',
      messages,
      messages_sent: 0,
      messages_remaining: experiment.max_messages || null,
      completion_message: experiment.completion_message,
    });
  }

  // Load messages
  const { data: messages } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true });

  const userMessages = (messages || []).filter((m) => m.role === 'user').length;
  const maxMessages = experiment.max_messages || null;

  // Prepend seed message if it exists and isn't already the first message
  const messageList = (messages || []).map((m) => ({
    role: m.role,
    content: m.content,
    timestamp: m.created_at,
  }));

  if (experiment.seed_message && messageList.length > 0 && messageList[0].content !== experiment.seed_message) {
    messageList.unshift({ role: 'assistant', content: experiment.seed_message });
  } else if (experiment.seed_message && messageList.length === 0) {
    messageList.unshift({ role: 'assistant', content: experiment.seed_message });
  }

  return Response.json({
    status: conversation.status,
    messages: messageList,
    messages_sent: userMessages,
    messages_remaining: maxMessages ? maxMessages - userMessages : null,
    completion_message: experiment.completion_message,
  });
}
