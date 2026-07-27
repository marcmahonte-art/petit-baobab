import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data } = await getSupabaseAdmin()
    .from("shop_orders")
    .select("order_number,email,phone,total,payment_status,status,created_at")
    .order("created_at", { ascending: false });

  const header = ["order_number", "email", "phone", "total", "payment_status", "status", "created_at"];
  const rows = (data || []).map((row: any) =>
    header.map((key) => JSON.stringify(row[key] ?? "")).join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=commandes-petit-baobab.csv",
    },
  });
}
