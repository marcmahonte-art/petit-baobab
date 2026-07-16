/**
 * Reliably trigger a browser download for a Blob.
 * Uses an object URL + anchor click and revokes it afterwards.
 * Trigger this while user activation is still valid (right after a click),
 * not after long awaited network calls, otherwise some browsers silently block it.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.style.display = "none"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
