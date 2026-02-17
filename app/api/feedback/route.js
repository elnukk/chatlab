import { createServerClient } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const { email, message } = await request.json();

    if (!message || !message.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase.from('feedback').insert({
      email: email || null,
      message: message.trim(),
    });

    if (error) {
      console.error('Feedback insert error:', error);
      return Response.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Feedback API error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
