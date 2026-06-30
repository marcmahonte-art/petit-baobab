/**
 * Petit Baobab — Migrate base64 drawings to Supabase Storage (S3)
 * 
 * Ce script :
 * 1. Récupère tous les dessins enregistrés avec des images en base64
 * 2. Les décode en buffers binaires
 * 3. Les upload sur Supabase Storage (drawings bucket)
 * 4. Met à jour la table saved_drawings avec les URLs publiques
 * 
 * Exécuter avec : node scripts/migrate-drawings-to-s3.mjs
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bsepfqpjomrtveavbfib.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZXBmcXBqb21ydHZlYXZiZmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MjU1MzIsImV4cCI6MjA5ODMwMTUzMn0.XmoMp3RTi8-kM4Kv_4HjPT-skRiTi31OArW3YcMwo00'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

function base64ToBuffer(base64DataUrl) {
  const parts = base64DataUrl.split(',')
  const base64Str = parts.length > 1 ? parts[1] : parts[0]
  return Buffer.from(base64Str, 'base64')
}

function getMimeType(base64DataUrl) {
  const match = base64DataUrl.match(/data:(.*?);/)
  return match ? match[1] : 'image/png'
}

async function run() {
  console.log('\n🚀 DÉMARRAGE DE LA MIGRATION DES DESSINS BASE64 → SUPABASE STORAGE\n')

  // 1. Récupérer tous les dessins en base64
  const { data: drawings, error: fetchErr } = await supabase
    .from('saved_drawings')
    .select('*')

  if (fetchErr) {
    console.error('❌ Impossible de charger les dessins depuis la base de données :', fetchErr.message)
    return
  }

  if (!drawings || drawings.length === 0) {
    console.log('✅ Aucun dessin trouvé dans la base de données. Rien à migrer.')
    return
  }

  console.log(`ℹ️ ${drawings.length} dessin(s) trouvé(s) au total. Analyse en cours...`)

  let migratedCount = 0
  let skippedCount = 0
  let errorCount = 0

  for (const draw of drawings) {
    const isImageBase64 = draw.image && draw.image.startsWith('data:')
    const isThumbBase64 = draw.thumbnail && draw.thumbnail.startsWith('data:')

    if (!isImageBase64 && !isThumbBase64) {
      console.log(`  [Ignoré] "${draw.name}" (ID: ${draw.id}) utilise déjà des URLs de stockage.`)
      skippedCount++
      continue
    }

    console.log(`\n⚙️ Migration de "${draw.name}" (ID: ${draw.id})...`)

    const profileId = draw.profile_id || 'anonymous'
    const type = draw.origin === 'ia' ? 'ai' : 'user'
    
    let publicImageUrl = draw.image
    let publicThumbUrl = draw.thumbnail

    try {
      // Migrate original high-res image
      if (isImageBase64) {
        const imgBuffer = base64ToBuffer(draw.image)
        const mimeType = getMimeType(draw.image)
        const imgPath = `${type}/${profileId}/${draw.id}.png`

        console.log(`  - Uploading original image to drawings/${imgPath}...`)
        const { error: imgUploadErr } = await supabase.storage
          .from('drawings')
          .upload(imgPath, imgBuffer, {
            contentType: mimeType,
            upsert: true
          })

        if (imgUploadErr) throw new Error(`Upload image: ${imgUploadErr.message}`)
        
        const { data: urlData } = supabase.storage
          .from('drawings')
          .getPublicUrl(imgPath)
        
        publicImageUrl = urlData.publicUrl
      }

      // Migrate thumbnail image
      if (isThumbBase64) {
        const thumbBuffer = base64ToBuffer(draw.thumbnail)
        const mimeType = getMimeType(draw.thumbnail)
        const thumbPath = `${type}/${profileId}/${draw.id}_thumb.png`

        console.log(`  - Uploading thumbnail to drawings/${thumbPath}...`)
        const { error: thumbUploadErr } = await supabase.storage
          .from('drawings')
          .upload(thumbPath, thumbBuffer, {
            contentType: mimeType,
            upsert: true
          })

        if (thumbUploadErr) throw new Error(`Upload thumbnail: ${thumbUploadErr.message}`)
        
        const { data: urlData } = supabase.storage
          .from('drawings')
          .getPublicUrl(thumbPath)
        
        publicThumbUrl = urlData.publicUrl
      }

      // Update database row
      console.log(`  - Updating database record...`)
      const { error: updateErr } = await supabase
        .from('saved_drawings')
        .update({
          image: publicImageUrl,
          thumbnail: publicThumbUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', draw.id)

      if (updateErr) throw new Error(`DB update: ${updateErr.message}`)

      console.log(`  ✅ "${draw.name}" a été migré avec succès !`)
      migratedCount++
    } catch (err) {
      console.error(`  ❌ Erreur lors de la migration de "${draw.name}" :`, err.message)
      errorCount++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Rapport final de migration')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  ✅ Migrés avec succès : ${migratedCount}`)
  console.log(`  ℹ️  Déjà stockés / ignorés : ${skippedCount}`)
  console.log(`  ❌ Échecs : ${errorCount}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

run().catch(console.error)
