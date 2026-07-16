import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bsepfqpjomrtveavbfib.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZXBmcXBqb21ydHZlYXZiZmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MjU1MzIsImV4cCI6MjA5ODMwMTUzMn0.XmoMp3RTi8-kM4Kv_4HjPT-skRiTi31OArW3YcMwo00'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSchema() {
  console.log('Querying saved_drawings schema details from information_schema...')
  
  // We can query using the supabase.rpc or a direct select if we have a view or custom function.
  // Wait, does the API allow select from information_schema?
  // Let's try running a direct query or checking what columns fail on insert or how we can get them.
  // Wait, if direct select on information_schema fails, we can query it using a temporary Postgres function we create or run a script.
  // Wait, let's try selecting from the table and checking the error or checking columns.
  
  const { data, error } = await supabase
    .from('saved_drawings')
    .select('progress')
    .limit(1)

  if (error) {
    console.error('Error fetching progress column:', error)
  } else {
    console.log('Progress column fetch result:', data)
  }
}

checkSchema().catch(console.error)
