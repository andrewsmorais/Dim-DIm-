import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';

const root = new URL('../../supabase/migrations/', import.meta.url).pathname;
const here = new URL('.', import.meta.url).pathname;
const db = new PGlite();

await db.exec(fs.readFileSync(here + 'stubs.sql', 'utf8'));
await db.exec(fs.readFileSync(root + '20261020060000_whatsapp_conversation.sql', 'utf8'));
console.log('migration aplicada no Postgres local');

try {
  await db.exec(fs.readFileSync(here + 'scenarios.sql', 'utf8'));
  console.log('cenários terminaram sem o RAISE final (inesperado)');
} catch (e) {
  const m = String(e.message);
  if (m.startsWith('RESULT ')) {
    const out = JSON.parse(m.slice(7));
    for (const [k, v] of Object.entries(out)) console.log(k.padEnd(28), JSON.stringify(v));
  } else {
    console.log('ERRO:', m);
    process.exitCode = 1;
  }
}

// Down também precisa rodar limpo.
await db.exec(fs.readFileSync(root + '20261020060000_whatsapp_conversation_down.sql', 'utf8'));
const left = await db.query(`select count(*)::int n from information_schema.tables where table_name in ('whatsapp_actions','whatsapp_pending')`);
console.log('down ok, tabelas restantes:', left.rows[0].n);
