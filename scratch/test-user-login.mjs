import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bsepfqpjomrtveavbfib.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZXBmcXBqb21ydHZlYXZiZmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MjU1MzIsImV4cCI6MjA5ODMwMTUzMn0.XmoMp3RTi8-kM4Kv_4HjPT-skRiTi31OArW3YcMwo00'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testUserFlow() {
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

  const user = loginData.user
  const session = loginData.session
  console.log('✅ Login succeeded! User ID:', user?.id)

  // 2. Fetch account
  console.log('2. Fetching account linked to user...')
  const { data: account, error: accError } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (accError) {
    console.error('❌ Failed to fetch account:', accError.message)
    return
  }

  console.log('Account ID:', account.id)
  console.log('Stars Balance:', account.stars_balance)
  console.log('Plan:', account.plan)

  // 3. Fetch child profiles
  console.log('3. Fetching child profiles...')
  const { data: profiles, error: profError } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('account_id', account.id)

  if (profError) {
    console.error('❌ Failed to fetch child profiles:', profError.message)
    return
  }

  console.log('Child Profiles found in DB:', profiles)

  // Test profile renaming if the profile name was "Mon Enfant"
  // Note: We can check if any profile got renamed or if one of them is active.
  const activeProfile = profiles[0]
  if (!activeProfile) {
    console.error('❌ No child profile found for account!')
    return
  }

  console.log('Using profile:', activeProfile)

  // 4. Test drawing insert
  console.log('4. Testing drawing insertion into saved_drawings...')
  const drawingId = 'test-prod-' + Date.now()
  const mockDrawing = {
    id: drawingId,
    name: 'Test Drawing wayacloud',
    model_name: 'Test Model',
    category: 'animals',
    origin: 'coloriage',
    status: 'completed',
    profile_id: activeProfile.id,
    progress: 'invalid_type_test',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_colored: true,
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

  const { data: insertedData, error: insertError } = await supabase
    .from('saved_drawings')
    .insert(mockDrawing)
    .select()

  if (insertError) {
    console.error('❌ Insertion failed under wayacloud profile:', insertError)
  } else {
    console.log('✅ Insertion succeeded under wayacloud profile!', insertedData)
    
    // Test fetching the saved drawing
    console.log('5. Testing fetching saved drawings...')
    const { data: fetchedDrawings, error: fetchError } = await supabase
      .from('saved_drawings')
      .select('*')
      .eq('profile_id', activeProfile.id)

    if (fetchError) {
      console.error('❌ Fetch failed:', fetchError.message)
    } else {
      console.log(`✅ Fetch succeeded! Found ${fetchedDrawings.length} drawing(s) for this profile:`, fetchedDrawings.map(d => d.name))
    }

    // Clean up
    console.log('Cleaning up test drawing...')
    const { error: deleteError } = await supabase
      .from('saved_drawings')
      .delete()
      .eq('id', drawingId)

    if (deleteError) {
      console.error('❌ Delete failed:', deleteError.message)
    } else {
      console.log('✅ Test drawing deleted successfully!')
    }
  }
}

testUserFlow().catch(console.error)
