import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { PRODUCTS } from "@/lib/mock/products";
import type { StoreDownload, StoreOrder, StoreReview, StoreWishlistItem } from "@/types/store";
import type { StoreUser } from "@/lib/store/auth";

export async function getStoreOrdersForUser(user: StoreUser, query?: string, status?: string) {
  const supabase = getSupabaseAdmin();
  let request = supabase
    .from("shop_orders")
    .select("*")
    .or(`customer_user_id.eq.${user.id},email.ilike.${user.email}`)
    .order("created_at", { ascending: false });

  if (status && status !== "all") request = request.eq("payment_status", status);
  const { data } = await request;
  const orders = ((data || []) as StoreOrder[]).filter((order) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(q) ||
      order.items.some((item) => item.title.toLowerCase().includes(q))
    );
  });
  return orders;
}

export async function getStoreOrderDetail(user: StoreUser, id: string) {
  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase
    .from("shop_orders")
    .select("*")
    .eq("id", id)
    .or(`customer_user_id.eq.${user.id},email.ilike.${user.email}`)
    .maybeSingle<StoreOrder>();

  if (!order) return null;

  const [{ data: downloads }, { data: events }] = await Promise.all([
    supabase.from("shop_downloads").select("*").eq("order_id", id),
    supabase.from("shop_order_events").select("*").eq("order_id", id).order("created_at", { ascending: true }),
  ]);

  let invoiceSignedUrl: string | null = null;
  if (order.invoice_url && order.payment_status === "paid") {
    const { data: signed } = await supabase.storage.from("shop-files").createSignedUrl(order.invoice_url, 600);
    invoiceSignedUrl = signed?.signedUrl || null;
  }

  return {
    order,
    downloads: (downloads || []) as StoreDownload[],
    events: events || [],
    invoiceSignedUrl,
  };
}

export async function getStoreDownloadsForUser(user: StoreUser) {
  const supabase = getSupabaseAdmin();
  const { data: orders } = await supabase
    .from("shop_orders")
    .select("id")
    .or(`customer_user_id.eq.${user.id},email.ilike.${user.email}`)
    .eq("payment_status", "paid");
  const ids = (orders || []).map((order) => order.id);
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from("shop_downloads")
    .select("*")
    .in("order_id", ids)
    .order("created_at", { ascending: false });
  return (data || []) as StoreDownload[];
}

export async function getStoreWishlist(user: StoreUser) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("wishlists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data || []) as StoreWishlistItem[];
}

export async function getStoreReviews(user: StoreUser) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data || []) as StoreReview[];
}

export function getPurchasedReviewTargets(orders: StoreOrder[]) {
  const map = new Map<string, { orderId: string; productId: string; productTitle: string }>();
  for (const order of orders.filter((o) => o.payment_status === "paid")) {
    for (const item of order.items) {
      map.set(`${order.id}:${item.productId}`, {
        orderId: order.id,
        productId: item.productId,
        productTitle: item.title,
      });
    }
  }
  return [...map.values()];
}

export function getProductById(id: string) {
  return PRODUCTS.find((product) => product.id === id);
}
