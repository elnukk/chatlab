import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { getAuthenticatedUser } from '@/lib/auth';

// GET /api/admin/experiments/[id]/export
export async function GET(request, { params }) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Verify the experiment belongs to the authenticated user
    const { data: experiment, error: expError } = await supabase
      .from('experiments')
      .select('id')
      .eq('id', id)
      .eq('created_by', auth.user.id)
      .single();

    if (expError || !experiment) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
    }

    // Fetch participants
    const { data: participants, error: partError } = await supabase
      .from('participants')
      .select('id, external_id, metadata')
      .eq('experiment_id', id);

    if (partError) {
      return NextResponse.json({ error: partError.message }, { status: 500 });
    }

    // Fetch conversations for these participants
    const participantIds = (participants || []).map((p) => p.id);

    let allConversations = [];
    let allMessages = [];

    if (participantIds.length > 0) {
      const { data: convs } = await supabase
        .from('conversations')
        .select('id, participant_id, status')
        .in('participant_id', participantIds);
      allConversations = convs || [];

      const convIds = allConversations.map((c) => c.id);
      if (convIds.length > 0) {
        const { data: msgs } = await supabase
          .from('messages')
          .select('id, conversation_id, role, content, created_at')
          .in('conversation_id', convIds)
          .order('created_at', { ascending: true });
        allMessages = msgs || [];
      }
    }

    // Build lookup maps
    const convsByParticipant = {};
    for (const conv of allConversations) {
      convsByParticipant[conv.participant_id] = conv;
    }
    const msgsByConv = {};
    for (const msg of allMessages) {
      if (!msgsByConv[msg.conversation_id]) msgsByConv[msg.conversation_id] = [];
      msgsByConv[msg.conversation_id].push(msg);
    }

    // Flatten messages for CSV and JSONL
    const flatMessages = [];
    for (const participant of (participants || [])) {
      const conv = convsByParticipant[participant.id];
      if (!conv) continue;
      const msgs = msgsByConv[conv.id] || [];
      msgs.forEach((msg, idx) => {
        flatMessages.push({
          experiment_id: id,
          participant_id: participant.external_id,
          message_index: idx,
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at,
        });
      });
    }

    // CSV format
    if (format === 'csv') {
      const columns = ['experiment_id', 'participant_id', 'message_index', 'role', 'content', 'timestamp'];
      const escapeCell = (val) => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };
      const header = columns.join(',');
      const rows = flatMessages.map((msg) =>
        columns.map((col) => escapeCell(msg[col])).join(',')
      );
      const csv = [header, ...rows].join('\n');

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="experiment_${id}.csv"`,
        },
      });
    }

    // JSONL format
    if (format === 'jsonl') {
      const lines = flatMessages.map((msg) => JSON.stringify(msg)).join('\n');

      return new Response(lines, {
        status: 200,
        headers: {
          'Content-Type': 'application/jsonl; charset=utf-8',
          'Content-Disposition': `attachment; filename="experiment_${id}.jsonl"`,
        },
      });
    }

    // JSON format (default) - grouped by participant
    const grouped = (participants || []).map((participant) => {
      const conv = convsByParticipant[participant.id];
      const msgs = conv ? (msgsByConv[conv.id] || []) : [];

      return {
        participant_id: participant.external_id,
        metadata: participant.metadata,
        status: conv?.status || 'not_started',
        messages: msgs.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at,
        })),
      };
    });

    return NextResponse.json({
      experiment_id: id,
      participants: grouped,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
