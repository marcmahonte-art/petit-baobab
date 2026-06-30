/**
 * Petit Baobab — Verify Supabase Storage Setup
 * 
 * Ce script vérifie que les buckets et la table ont été créés correctement.
 * 
 * Exécuter avec : node scripts/verify-supabase-setup.mjs
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bsepfqpjomrtveavbfib.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZXBmcXBqb21ydHZlYXZiZmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MjU1MzIsImV4cCI6MjA5ODMwMTUzMn0.XmoMp3RTi8-kM4Kv_4HjPT-skRiTi31OArW3YcMwo00'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const PASS = '\x1b[32m✅ PASS\x1b[0m'
const FAIL = '\x1b[31m❌ FAIL\x1b[0m'
const INFO = '\x1b[36mℹ️ \x1b[0m'

let allPassed = true

function check(label, passed, detail = '') {
  if (passed) {
    console.log(`  ${PASS}  ${label}`)
  } else {
    console.log(`  ${FAIL}  ${label}${detail ? ' — ' + detail : ''}`)
    allPassed = false
  }
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Petit Baobab — Vérification Supabase')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // ── 1. Vérifier le bucket "drawings" (via upload test) ──
  console.log(`${INFO}Vérification du bucket "drawings"...`)
  const testContent = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]) // PNG header bytes
  const testPathDrawings = '_test/verify-setup.png'

  const { error: uploadDrawingsErr } = await supabase.storage
    .from('drawings')
    .upload(testPathDrawings, testContent, {
      contentType: 'image/png',
      upsert: true,
    })

  if (uploadDrawingsErr) {
    check('Bucket "drawings" — upload', false, uploadDrawingsErr.message)
  } else {
    check('Bucket "drawings" — upload', true)

    const { data: urlDrawings } = supabase.storage
      .from('drawings')
      .getPublicUrl(testPathDrawings)

    check('Bucket "drawings" — URL publique', !!urlDrawings?.publicUrl)
    if (urlDrawings?.publicUrl) {
      console.log(`    → ${urlDrawings.publicUrl}`)
    }

    const { error: deleteDrawingsErr } = await supabase.storage
      .from('drawings')
      .remove([testPathDrawings])

    check('Bucket "drawings" — suppression', !deleteDrawingsErr)
  }

  // ── 2. Vérifier le bucket "books" (via upload test) ──
  console.log(`\n${INFO}Vérification du bucket "books"...`)
  const testPathBooks = '_test/verify-setup.pdf'
  // Minimal PDF bytes
  const testPdfContent = new TextEncoder().encode('%PDF-1.0 test')

  const { error: uploadBooksErr } = await supabase.storage
    .from('books')
    .upload(testPathBooks, testPdfContent, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadBooksErr) {
    check('Bucket "books" — upload', false, uploadBooksErr.message)
  } else {
    check('Bucket "books" — upload', true)

    const { data: urlBooks } = supabase.storage
      .from('books')
      .getPublicUrl(testPathBooks)

    check('Bucket "books" — URL publique', !!urlBooks?.publicUrl)
    if (urlBooks?.publicUrl) {
      console.log(`    → ${urlBooks.publicUrl}`)
    }

    const { error: deleteBooksErr } = await supabase.storage
      .from('books')
      .remove([testPathBooks])

    check('Bucket "books" — suppression', !deleteBooksErr)
  }

  // ── 3. Vérifier la table "books" ──
  console.log(`\n${INFO}Vérification de la table "books"...`)
  const { data: booksData, error: booksTableErr } = await supabase
    .from('books')
    .select('id')
    .limit(1)

  if (booksTableErr) {
    check('Table "books" existe et accessible', false, booksTableErr.message)
  } else {
    check('Table "books" existe et accessible', true)
    console.log(`    → ${booksData.length} livre(s) trouvé(s)`)
  }

  // ── 4. Vérifier la table "saved_drawings" ──
  console.log(`\n${INFO}Vérification de la table "saved_drawings"...`)
  const { data: drawingsData, error: drawingsTableErr } = await supabase
    .from('saved_drawings')
    .select('id')
    .limit(1)

  if (drawingsTableErr) {
    check('Table "saved_drawings" existe', false, drawingsTableErr.message)
  } else {
    check('Table "saved_drawings" existe', true)
    console.log(`    → ${drawingsData.length} dessin(s) trouvé(s)`)
  }

  // ── Résultat final ──
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  if (allPassed) {
    console.log('  \x1b[32m🎉 Tout est correctement configuré !\x1b[0m')
  } else {
    console.log('  \x1b[33m⚠️  Certains éléments nécessitent une attention.\x1b[0m')
    console.log('  Exécute le script SQL dans le Dashboard Supabase :')
    console.log('  → scripts/setup-supabase-storage.sql')
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main().catch(console.error)
