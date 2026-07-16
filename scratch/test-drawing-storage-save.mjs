import { RemoteDrawingStorage } from '../src/features/drawings/DrawingStorage.js'
import { createClient } from '@supabase/supabase-js'

// Mock the environment variables needed for supabase client
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://bsepfqpjomrtveavbfib.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZXBmcXBqb21ydHZlYXZiZmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MjU1MzIsImV4cCI6MjA5ODMwMTUzMn0.XmoMp3RTi8-kM4Kv_4HjPT-skRiTi31OArW3YcMwo00'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function runTest() {
  const email = 'wayacloud@gmail.com'
  const password = 'Polobaby77'

  console.log(`1. Logging in user: ${email}`)
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (loginError) {
    console.error('❌ Login failed:', loginError.message)
    return
  }

  // Get active session token to mock auth headers in client
  const session = loginData.session
  
  // Create a new Supabase client with the user's access token to simulate the authenticated browser context
  const authSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    }
  )

  // Retrieve child profile
  const { data: account } = await authSupabase
    .from('accounts')
    .select('id')
    .single()

  const { data: profiles } = await authSupabase
    .from('child_profiles')
    .select('id')
    .eq('account_id', account.id)

  const profileId = profiles[0].id
  console.log('User active profile ID:', profileId)

  // Instantiate storage service with the authenticated supabase client
  // Wait, we need to import dynamically or use the class
  // Since we want to use the actual class code, let's load it
  const { RemoteDrawingStorage } = await import('../src/features/drawings/DrawingStorage.js')
  const storage = new RemoteDrawingStorage()
  
  // Override the internal supabase client in the storage instance with our authenticated client
  // so the queries run under this user's session
  storage.supabase = authSupabase

  const drawingId = 'test-class-' + Date.now()
  const mockDrawing = {
    id: drawingId,
    name: 'Test Class Save',
    modelName: 'Test Model',
    category: 'animals',
    origin: 'coloriage',
    status: 'completed',
    profileId: profileId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isColored: true,
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    template: { id: 'animals-dog', name: 'Dog', image: '/illustrations/animals/dog.svg', category: 'animals' },
    state: {
      canvasJson: '{}',
      selectedTool: 'brush',
      selectedColor: '#000000',
      brushSize: 6,
      usedColors: [],
      filledZones: 0,
    }
  }

  console.log('2. Running RemoteDrawingStorage.save()...')
  try {
    const saved = await storage.save(mockDrawing)
    console.log('✅ RemoteDrawingStorage.save() succeeded!', saved.name)

    console.log('3. Running RemoteDrawingStorage.list()...')
    const list = await storage.list()
    const found = list.find(d => d.id === drawingId)
    if (found) {
      console.log('✅ RemoteDrawingStorage.list() successfully found the saved drawing in the gallery!')
    } else {
      console.error('❌ Drawing not found in listed results.')
    }

    // Clean up
    console.log('Cleaning up...')
    await authSupabase
      .from('saved_drawings')
      .delete()
      .eq('id', drawingId)
    console.log('✅ Cleaned up successfully!')
  } catch (err) {
    console.error('❌ Test failed with error:', err)
  }
}

runTest().catch(console.error)
