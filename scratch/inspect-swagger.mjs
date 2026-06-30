const supabaseUrl = 'https://bsepfqpjomrtveavbfib.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZXBmcXBqb21ydHZlYXZiZmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MjU1MzIsImV4cCI6MjA5ODMwMTUzMn0.XmoMp3RTi8-kM4Kv_4HjPT-skRiTi31OArW3YcMwo00'

async function main() {
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': supabaseAnonKey
    }
  })
  const schema = await res.json()
  console.log('Schema:', schema)
}

main().catch(console.error)
