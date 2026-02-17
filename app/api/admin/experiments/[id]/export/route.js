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

    // Fetch participants with conversations and messages
    const { data: participants, error } = await supabase
      .from('participants')
      .select(`
        id,
        external_id,
        metadata,
        conversations(
          id,
          status,
          messages(
            id,
            role,
            content,
            created_at
          )
        )
      `)
      .eq('experiment_id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten messages for CSV and JSONL
    const flatMessages = [];
    for (const participant of participants) {
      for (const conv of participant.conversations || []) {
        const sortedMessages = (conv.messages || []).sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );

        sortedMessages.forEach((msg, idx) => {
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
    const grouped = participants.map((participant) => {
      const conversation = participant.conversations?.[0];
      const sortedMessages = conversation
        ? (conversation.messages || []).sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          )
        : [];

      return {
        participant_id: participant.external_id,
        metadata: participant.metadata,
        status: conversation?.status || 'not_started',
        messages: sortedMessages.map((msg) => ({
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
