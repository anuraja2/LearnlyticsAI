import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://ktvvxizjblmiqtrbgsyc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_KEY is not set in .env file!');
  console.error('   Go to: Supabase Dashboard → Project Settings → API → service_role key');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// ── Utility: Convert snake_case DB rows to camelCase (MongoDB-compatible) ──
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function toDoc(row) {
  if (!row) return null;
  const doc = {};
  for (const [key, val] of Object.entries(row)) {
    const camelKey = snakeToCamel(key);
    doc[camelKey] = val;
  }
  // Add _id alias for MongoDB compat
  doc._id = row.id;
  return doc;
}

export function toDocs(rows) {
  if (!rows) return [];
  return rows.map(toDoc);
}

// ── Utility: Check Supabase connection ──
export async function testConnection() {
  try {
    const { error } = await supabase.from('parents').select('id').limit(1);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase connection test failed:', err.message);
    return false;
  }
}
