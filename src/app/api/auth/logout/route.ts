import { NextResponse } from "next/server"
import { clearAuthCookies } from "@/lib/auth"

export async function POST() {
  try {
    await clearAuthCookies()
    return NextResponse.json({ success: true, message: "Déconnecté avec succès." })
  } catch (err: any) {
    console.error("Logout API route error:", err)
    return NextResponse.json(
      { error: err.message || "Une erreur est survenue lors de la déconnexion." },
      { status: 500 }
    )
  }
}
