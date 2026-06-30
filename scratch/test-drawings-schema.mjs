import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bsepfqpjomrtveavbfib.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZXBmcXBqb21ydHZlYXZiZmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MjU1MzIsImV4cCI6MjA5ODMwMTUzMn0.XmoMp3RTi8-kM4Kv_4HjPT-skRiTi31OArW3YcMwo00'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const columns = [
  'id',
  'name',
  'model_name',
  'category',
  'origin',
  'status',
  'profile_id',
  'created_at',
  'updated_at',
  'is_colored',
  'image',
  'thumbnail',
  'template',
  'state'
]

async function main() {
  console.log('Testing columns on saved_drawings:')
  for (const col of columns) {
    const { error } = await supabase
      .from('saved_drawings')
      .select(col)
      .limit(1)
    
    if (error) {
      console.log(`  ❌ ${col}: NOT FOUND (${error.message})`)
    } else {
      console.log(`  ✅ ${col}: EXISTS`)
    }
  }
}

main().catch(console.error)
