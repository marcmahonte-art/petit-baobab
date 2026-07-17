const fs = require("fs")
const path = require("path")
const { createClient } = require("@supabase/supabase-js")

function loadEnv(file) {
  const p = path.join(__dirname, "..", file)
  if (!fs.existsSync(p)) return
  const content = fs.readFileSync(p, "utf8")
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*?)"?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}
loadEnv(".env.vercel")
loadEnv(".env.seed")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Variables Supabase manquantes")
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const TEACHER_EMAIL = "test.enseignant.pb@gmail.com"
const TEACHER_PASSWORD = "Test1234!"

async function main() {
  // 1. Create Supabase Auth user for the teacher
  let authUserId
  const { data: existingUsers } = await admin.auth.admin.listUsers()
  const found = existingUsers?.users?.find((u) => u.email === TEACHER_EMAIL)
  if (found) {
    authUserId = found.id
    console.log("Enseignant deja existant, id=" + authUserId)
  } else {
    const { data: newUser, error: signupErr } = await admin.auth.admin.createUser({
      email: TEACHER_EMAIL,
      password: TEACHER_PASSWORD,
      email_confirm: true,
    })
    if (signupErr) {
      console.error("Erreur creation auth user:", signupErr.message)
      process.exit(1)
    }
    authUserId = newUser.user.id
    console.log("Enseignant cree, id=" + authUserId)
  }

  // 2. Ensure accounts row exists
  let { data: account } = await admin
    .from("accounts")
    .select("id, stars_balance, plan")
    .eq("user_id", authUserId)
    .maybeSingle()

  if (!account) {
    const { data: newAccount, error: accErr } = await admin
      .from("accounts")
      .insert({ user_id: authUserId, stars_balance: 1000, plan: "ecole_pro" })
      .select()
      .single()
    if (accErr) {
      console.error("Erreur creation account:", accErr.message)
      process.exit(1)
    }
    account = newAccount
    console.log("Account ecole_pro cree, id=" + account.id)
  } else {
    console.log("Account existant, id=" + account.id)
  }

  // 3. Create classroom
  const className = "CE1 Test Baobab"
  const { data: existingClass } = await admin
    .from("classrooms")
    .select("id, class_code")
    .eq("account_id", account.id)
    .eq("name", className)
    .is("archived_at", null)
    .maybeSingle()

  let classroom
  if (existingClass) {
    classroom = existingClass
    console.log("Classe existante, code=" + classroom.class_code)
  } else {
    const { data: newClass, error: classErr } = await admin
      .from("classrooms")
      .insert({ account_id: account.id, name: className, academic_year: "2025-2026" })
      .select()
      .single()
    if (classErr) {
      console.error("Erreur creation classe:", classErr.message)
      process.exit(1)
    }
    classroom = newClass
    console.log("Classe creee, code=" + classroom.class_code)
  }

  // 4. Create students + child profiles
  const students = [
    { first_name: "Awa", mascot: "awa", display_name: "Awa" },
    { first_name: "Kofi", mascot: "lion", display_name: "Kofi" },
    { first_name: "Aminata", mascot: "robot", display_name: "Aminata" },
    { first_name: "Fatima", mascot: "awa", display_name: "Fatima" },
    { first_name: "Abdoul", mascot: "lion", display_name: "Abdoul" },
    { first_name: "Awa", mascot: "robot", display_name: "Awa (B)" },
  ]

  for (const s of students) {
    // avoid duplicates
    const { data: dup } = await admin
      .from("school_students")
      .select("id")
      .eq("classroom_id", classroom.id)
      .eq("first_name", s.first_name)
      .eq("display_name", s.display_name)
      .is("deleted_at", null)
      .maybeSingle()
    if (dup) {
      console.log("Eleve deja present: " + s.display_name)
      continue
    }
    const { data: stu, error: stuErr } = await admin
      .from("school_students")
      .insert({
        classroom_id: classroom.id,
        first_name: s.first_name,
        display_name: s.display_name,
        mascot: s.mascot,
      })
      .select()
      .single()
    if (stuErr) {
      console.error("Erreur eleve " + s.first_name + ":", stuErr.message)
      continue
    }
    const { error: profErr } = await admin
      .from("child_profiles")
      .insert({
        account_id: account.id,
        name: s.display_name,
        mascot: s.mascot,
        pin_required: false,
        student_id: stu.id,
        classroom_id: classroom.id,
      })
    if (profErr) {
      console.error("Erreur profil " + s.first_name + ":", profErr.message)
      continue
    }
    console.log("Eleve cree: " + s.display_name + " (" + s.mascot + ")")
  }

  console.log("")
  console.log("==========================================")
  console.log("  COMPTE DE TEST CREE")
  console.log("==========================================")
  console.log("  Enseignant : " + TEACHER_EMAIL)
  console.log("  Mot de passe : " + TEACHER_PASSWORD)
  console.log("  Espace enseignant : https://petit-baobab.vercel.app/login")
  console.log("  Code de classe eleve : " + classroom.class_code)
  console.log("  Espace eleve : https://petit-baobab.vercel.app/school")
  console.log("  Eleves : Awa, Kofi, Aminata, Fatima, Abdoul (+ homonyme 'Awa')")
  console.log("==========================================")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
