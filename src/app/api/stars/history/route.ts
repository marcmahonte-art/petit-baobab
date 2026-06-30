import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { getServerUser } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // 1. Verify user session
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accéder à ces données." },
        { status: 401 }
      )
    }

    // 2. Fetch the linked account
    const { data: account, error: accError } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (accError || !account) {
      return NextResponse.json(
        { error: "Compte introuvable pour cet utilisateur." },
        { status: 404 }
      )
    }

    // 3. Extract pagination parameters
    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10)))
    const offset = (page - 1) * limit

    // 4. Query transactions
    const { data: transactions, error: txError, count } = await supabase
      .from("stars_transactions")
      .select("*", { count: "exact" })
      .eq("account_id", account.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (txError) {
      return NextResponse.json(
        { error: txError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (err: any) {
    console.error("Stars history API route error:", err)
    return NextResponse.json(
      { error: err.message || "Une erreur interne est survenue lors de la récupération de l'historique." },
      { status: 500 }
    )
  }
}
