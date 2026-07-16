import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bsepfqpjomrtveavbfib.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZXBmcXBqb21ydHZlYXZiZmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MjU1MzIsImV4cCI6MjA5ODMwMTUzMn0.XmoMp3RTi8-kM4Kv_4HjPT-skRiTi31OArW3YcMwo00'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testInsert() {
  console.log('Testing insert into saved_drawings...')
  
  const mockDrawingId = 'test-' + Date.now()
  const mockDrawing = {
    id: mockDrawingId,
    name: 'Test Drawing',
    model_name: 'Test Model',
    category: 'animals',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
      profileId: 'anonymous',
      origin: 'coloriage',
      status: 'completed',
      isColored: true
    }
  }

  const { data, error } = await supabase
    .from('saved_drawings')
    .insert(mockDrawing)
    .select()

  if (error) {
    console.error('❌ Insert failed:', error)
  } else {
    console.log('✅ Insert succeeded!', data)
    
    // Now try fetching
    console.log('Fetching drawings...')
    const { data: fetchedData, error: fetchError } = await supabase
      .from('saved_drawings')
      .select('*')
      .eq('id', mockDrawingId)
      
    if (fetchError) {
      console.error('❌ Fetch failed:', fetchError)
    } else {
      console.log('✅ Fetch succeeded!', fetchedData)
    }

    // Clean up
    console.log('Cleaning up...')
    const { error: deleteError } = await supabase
      .from('saved_drawings')
      .delete()
      .eq('id', mockDrawingId)
      
    if (deleteError) {
      console.error('❌ Delete failed:', deleteError)
    } else {
      console.log('✅ Cleaned up successfully!')
    }
  }
}

testInsert().catch(console.error)
