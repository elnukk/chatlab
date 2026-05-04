import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getExperimentAccess } from '@/lib/utils/experiment-access';

// GET /api/admin/experiments/[id]/collaborators
export async function GET(request, { params }) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServerClient();
    const { id } = params;

    const access = await getExperimentAccess(supabase, id, auth.user.id);
    if (!access) return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });

    const { data, error } = await supabase
      .from('experiment_collaborators')
      .select('researcher_id, created_at, researchers(name, email)')
      .eq('experiment_id', id)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const result = (data || []).map((row) => ({
      researcher_id: row.researcher_id,
      name: row.researchers?.name,
      email: row.researchers?.email,
      added_at: row.created_at,
    }));

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/experiments/[id]/collaborators
export async function POST(request, { params }) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServerClient();
    const { id } = params;

    const access = await getExperimentAccess(supabase, id, auth.user.id);
    if (!access) return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
    if (!access.isOwner) return NextResponse.json({ error: 'Only the owner can manage collaborators' }, { status: 403 });

    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const { data: researcher } = await supabase
      .from('researchers')
      .select('id, name, email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (!researcher) {
      return NextResponse.json(
        { error: 'No account found for that email. Ask your collaborator to sign up to ChatLab first.' },
        { status: 404 }
      );
    }

    if (researcher.id === auth.user.id) {
      return NextResponse.json({ error: 'You cannot add yourself as a collaborator' }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('experiment_collaborators')
      .insert({ experiment_id: id, researcher_id: researcher.id, invited_by: auth.user.id });

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'This person is already a collaborator' }, { status: 409 });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      { researcher_id: researcher.id, name: researcher.name, email: researcher.email },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/experiments/[id]/collaborators
export async function DELETE(request, { params }) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServerClient();
    const { id } = params;

    const access = await getExperimentAccess(supabase, id, auth.user.id);
    if (!access) return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
    if (!access.isOwner) return NextResponse.json({ error: 'Only the owner can manage collaborators' }, { status: 403 });

    const { researcher_id } = await request.json();
    if (!researcher_id) return NextResponse.json({ error: 'researcher_id is required' }, { status: 400 });

    const { error } = await supabase
      .from('experiment_collaborators')
      .delete()
      .eq('experiment_id', id)
      .eq('researcher_id', researcher_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
