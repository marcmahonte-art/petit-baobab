import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServer()
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get("status") || ""
    const search = url.searchParams.get("search") || ""
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10))
    const limit = 20
    const offset = (page - 1) * limit

    let query = supabase
      .from("payments")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }
    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%,transaction_id.ilike.%${search}%`)
    }

    const { data: payments, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      payments,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (err: any) {
    console.error("Payments API error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
