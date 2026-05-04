import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { getAuthenticatedUser } from '@/lib/auth';

// GET /api/admin/experiments
export async function GET() {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    const { data: owned, error } = await supabase
      .from('experiments')
      .select('*, participants(id)')
      .eq('created_by', auth.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: collabs } = await supabase
      .from('experiment_collaborators')
      .select('experiment_id')
      .eq('researcher_id', auth.user.id);

    let shared = [];
    const collabIds = (collabs || []).map((c) => c.experiment_id);
    if (collabIds.length > 0) {
      const { data } = await supabase
        .from('experiments')
        .select('*, participants(id)')
        .in('id', collabIds)
        .order('created_at', { ascending: false });
      shared = data || [];
    }

    const format = (exp, isOwner) => ({
      ...exp,
      llm_api_key: exp.llm_api_key ? '••••••' + exp.llm_api_key.slice(-4) : null,
      participants_count: exp.participants?.length ?? 0,
      participants: undefined,
      is_owner: isOwner,
    });

    const result = [
      ...(owned || []).map((exp) => format(exp, true)),
      ...shared.map((exp) => format(exp, false)),
    ];

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/experiments
export async function POST(request) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const body = await request.json();

    const {
      name,
      description,
      llm_provider,
      llm_model,
      llm_temperature,
      llm_max_tokens,
      llm_api_key,
      allowed_origins,
      system_prompt,
      seed_message,
      max_messages,
      completion_message,
    } = body;

    const insertData = {
      name,
      description,
      created_by: auth.user.id,
      llm_provider,
      llm_model,
      llm_temperature,
      llm_max_tokens,
      allowed_origins,
      system_prompt: system_prompt || '',
      seed_message: seed_message || '',
      max_messages: max_messages || null,
      completion_message: completion_message || 'Thank you for completing this conversation.',
    };
    if (llm_api_key) {
      insertData.llm_api_key = llm_api_key;
    }

    const { data: experiment, error: expError } = await supabase
      .from('experiments')
      .insert(insertData)
      .select()
      .single();

    if (expError) {
      return NextResponse.json({ error: expError.message }, { status: 500 });
    }

    return NextResponse.json(experiment, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
