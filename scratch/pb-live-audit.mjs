import { chromium } from "playwright"
import fs from "node:fs/promises"
import path from "node:path"

const baseUrl = "https://petit-baobab.vercel.app"
const outDir = path.resolve("scratch", "pb-audit-output")
await fs.mkdir(outDir, { recursive: true })

const report = {
  startedAt: new Date().toISOString(),
  steps: [],
  networkErrors: [],
  consoleErrors: [],
  storage: {},
}

function clean(text) {
  return (text || "").replace(/\s+/g, " ").trim()
}

async function snap(page, name) {
  const file = path.join(outDir, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  report.steps.push({
    name,
    url: page.url(),
    text: clean(await page.locator("body").innerText().catch(() => "")).slice(0, 3500),
    screenshot: file,
  })
}

async function clickText(page, texts) {
  for (const text of texts) {
    const locator = page.getByText(text, { exact: false }).first()
    if (await locator.count().catch(() => 0)) {
      await locator.click({ timeout: 5000 }).catch(async () => {
        await page.locator(`text=${text}`).first().click({ timeout: 5000 })
      })
      return true
    }
  }
  return false
}

async function fillByHints(page, hints, value) {
  for (const hint of hints) {
    const byLabel = page.getByLabel(hint, { exact: false }).first()
    if (await byLabel.count().catch(() => 0)) {
      await byLabel.fill(value)
      return true
    }
    const byPlaceholder = page.getByPlaceholder(hint, { exact: false }).first()
    if (await byPlaceholder.count().catch(() => 0)) {
      await byPlaceholder.fill(value)
      return true
    }
  }
  return false
}

async function teacherLogin(page) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" })
  await snap(page, "01-login")
  await fillByHints(page, ["email", "adresse"], "test.enseignant.pb@gmail.com")
  await fillByHints(page, ["mot de passe", "password"], "Test1234!")
  await page.getByRole("button").filter({ hasText: /connect|connexion|log in/i }).first().click()
  await page.waitForLoadState("networkidle").catch(() => {})
  await page.waitForTimeout(1500)
  await snap(page, "02-after-teacher-login")
  if (page.url().includes("select-space") || (await page.getByText(/espace Ã©cole/i).count().catch(() => 0))) {
    await clickText(page, ["Espace Ã©cole", "AccÃ©der"])
    await page.waitForLoadState("networkidle").catch(() => {})
    await page.waitForTimeout(1200)
    await snap(page, "03-school-space")
  }
}

async function createClass(page) {
  await page.goto(`${baseUrl}/school/classes/create`, { waitUntil: "networkidle" })
  await snap(page, "04-create-class-form")
  const className = `Audit ${Date.now().toString().slice(-5)}`
  await fillByHints(page, ["nom", "classe"], className)
  await fillByHints(page, ["niveau"], "CE1")
  await clickText(page, ["CrÃ©er", "Enregistrer", "Ajouter"])
  await page.waitForLoadState("networkidle").catch(() => {})
  await page.waitForTimeout(2000)
  await snap(page, "05-after-create-class")
  return className
}

async function addStudent(page, firstName) {
  await page.goto(`${baseUrl}/school/students/add`, { waitUntil: "networkidle" })
  await snap(page, `06-add-student-form-${firstName}`)
  await fillByHints(page, ["prÃ©nom", "prenom", "first"], firstName)
  await fillByHints(page, ["nom", "last"], "Audit")
  await clickText(page, ["Ajouter", "CrÃ©er", "Enregistrer"])
  await page.waitForLoadState("networkidle").catch(() => {})
  await page.waitForTimeout(1500)
  await snap(page, `07-after-add-student-${firstName}`)
}

async function readStudents(page) {
  await page.goto(`${baseUrl}/school/students`, { waitUntil: "networkidle" })
  await page.waitForTimeout(1500)
  await snap(page, "08-students-list")
  const text = clean(await page.locator("body").innerText())
  const codes = [...text.matchAll(/[A-Z]{3,10}-[A-Z0-9]{2,10}|[A-Z0-9]{4,}-[A-Z0-9]{2,}/g)].map((m) => m[0])
  report.detectedClassCodes = [...new Set(codes)]
  return text
}

async function studentLogin(browser, classCode, firstName, label) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 820 }, locale: "fr-FR" })
  const page = await context.newPage()
  attachLogging(page)
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" })
  await clickText(page, ["Connexion Ã©lÃ¨ve", "Student login"])
  await page.waitForTimeout(600)
  await snap(page, `09-${label}-student-login-form`)
  await fillByHints(page, ["code", "classe"], classCode)
  await fillByHints(page, ["prÃ©nom", "prenom"], firstName)
  await clickText(page, ["C'est parti", "parti"])
  await page.waitForLoadState("networkidle").catch(() => {})
  await page.waitForTimeout(2000)
  await snap(page, `10-${label}-after-student-login`)
  await page.goto(`${baseUrl}/coloriage`, { waitUntil: "networkidle" }).catch(() => {})
  await page.waitForTimeout(1200)
  await snap(page, `11-${label}-coloriage`)
  await page.goto(`${baseUrl}/mes-livres`, { waitUntil: "networkidle" }).catch(() => {})
  await page.waitForTimeout(1200)
  await snap(page, `12-${label}-mes-livres`)
  report.storage[label] = await page.evaluate(() => ({
    localStorage: Object.fromEntries(Object.entries(localStorage)),
    sessionStorage: Object.fromEntries(Object.entries(sessionStorage)),
    cookies: document.cookie,
  }))
  await context.close()
}

function attachLogging(page) {
  page.on("console", (msg) => {
    if (["error", "warning"].includes(msg.type())) {
      report.consoleErrors.push({ type: msg.type(), text: msg.text(), url: page.url() })
    }
  })
  page.on("pageerror", (err) => report.consoleErrors.push({ type: "pageerror", text: err.message, url: page.url() }))
  page.on("response", (res) => {
    if (res.status() >= 400) report.networkErrors.push({ status: res.status(), url: res.url(), page: page.url() })
  })
}

const explicitChromium = "C:/Users/Lenovo/AppData/Local/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe"
const launchOptions = {}
try {
  await fs.access(explicitChromium)
  launchOptions.executablePath = explicitChromium
} catch {}

const browser = await chromium.launch({ headless: true, ...launchOptions })
const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, locale: "fr-FR" })
const page = await context.newPage()
attachLogging(page)

try {
  await teacherLogin(page)
  await createClass(page)
  await addStudent(page, "Aminata")
  await addStudent(page, "Kofi")
  const studentsText = await readStudents(page)
  const code = report.detectedClassCodes?.[0] || ""
  report.teacherStudentsText = studentsText.slice(0, 5000)
  report.classCodeUsedForStudentTests = code
  if (code) {
    await studentLogin(browser, code, "Aminata", "student-a")
    await studentLogin(browser, code, "Kofi", "student-b")
  }
} catch (error) {
  report.fatalError = { message: error.message, stack: error.stack }
  await snap(page, "fatal-error").catch(() => {})
} finally {
  await fs.writeFile(path.join(outDir, "report.json"), JSON.stringify(report, null, 2), "utf8")
  await browser.close().catch(() => {})
  console.log(JSON.stringify(report, null, 2))
}

