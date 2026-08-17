import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('Testing Supabase PostgreSQL Connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  const { data, error } = await supabase.from('rooms').select('*').limit(1);
  if (error) {
    console.error('❌ Supabase Query Result:', error.message);
    if (error.message.includes('relation "public.rooms" does not exist')) {
      console.log('⚠️ Notice: Tablo "rooms" henüz veritabanında açılmamış.');
    }
  } else {
    console.log('🎉 SUCCESS: Supabase PostgreSQL Connection Verified!');
    console.log('Rooms Count / Data:', data);
  }
}

testConnection();
