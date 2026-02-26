import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { getAuthenticatedUser } from '@/lib/auth';

// GET /api/admin/experiments/[id]
export async function GET(request, { params }) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const { id } = params;

    const { data: experiment, error } = await supabase
      .from('experiments')
      .select('*')
      .eq('id', id)
      .eq('created_by', auth.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (experiment.llm_api_key) {
      experiment.llm_api_key = '••••••' + experiment.llm_api_key.slice(-4);
    }

    return NextResponse.json(experiment);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/admin/experiments/[id]
export async function PUT(request, { params }) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const { id } = params;
    const body = await request.json();

    const allowedFields = [
      'name',
      'description',
      'status',
      'llm_provider',
      'llm_model',
      'llm_temperature',
      'llm_max_tokens',
      'llm_api_key',
      'allowed_origins',
      'system_prompt',
      'seed_message',
      'max_messages',
      'completion_message',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'llm_api_key' && body[field] && body[field].startsWith('••••••')) {
          continue;
        }
        updates[field] = body[field];
      }
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('experiments')
      .update(updates)
      .eq('id', id)
      .eq('created_by', auth.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/experiments/[id]
export async function DELETE(request, { params }) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const { id } = params;

    const { error } = await supabase
      .from('experiments')
      .delete()
      .eq('id', id)
      .eq('created_by', auth.user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
