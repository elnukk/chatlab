import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { getAuthenticatedUser } from '@/lib/auth';

// GET /api/admin/experiments/[id]/participants
export async function GET(request, { params }) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const { id } = params;

    const { data: participants, error } = await supabase
      .from('participants')
      .select(`
        *,
        conversations(
          id,
          status,
          started_at,
          completed_at
        )
      `)
      .eq('experiment_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = participants.map((p) => {
      const conversation = p.conversations?.[0] || null;

      return {
        id: p.id,
        external_id: p.external_id,
        experiment_id: p.experiment_id,
        metadata: p.metadata,
        created_at: p.created_at,
        conversation_status: conversation?.status || 'not_started',
        started_at: conversation?.started_at || null,
        completed_at: conversation?.completed_at || null,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
