import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { encryptApiKey, isEncrypted } from '@/lib/crypto';

// POST /api/admin/migrate-keys
// One-time endpoint to encrypt all plain-text API keys in the DB.
export async function POST() {
  try {
    const supabase = createServerClient();

    const { data: experiments, error } = await supabase
      .from('experiments')
      .select('id, llm_api_key')
      .not('llm_api_key', 'is', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const toMigrate = (experiments || []).filter(
      (e) => e.llm_api_key && !isEncrypted(e.llm_api_key)
    );

    let migrated = 0;
    for (const exp of toMigrate) {
      const { error: updateError } = await supabase
        .from('experiments')
        .update({ llm_api_key: encryptApiKey(exp.llm_api_key) })
        .eq('id', exp.id);

      if (updateError) {
        return NextResponse.json(
          { error: `Failed to migrate experiment ${exp.id}: ${updateError.message}` },
          { status: 500 }
        );
      }
      migrated++;
    }

    return NextResponse.json({
      migrated,
      skipped: (experiments || []).length - migrated,
      message: `Encrypted ${migrated} API key(s). ${(experiments || []).length - migrated} were already encrypted.`,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
