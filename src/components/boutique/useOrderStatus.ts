"use client";

// Hook partagé : résout order_id + access_token depuis l'URL (?order&token)
// ou depuis localStorage (pb_boutique_last_order), puis interroge
// /api/payment/status. Utilisé par /boutique/merci et /boutique/mes-achats.
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export interface OrderStatusItem {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderStatusData {
  order: {
    id: string;
    order_number: string;
    first_name: string;
    items: OrderStatusItem[];
    total: number;
    total_ht: number;
    payment_status: string;
    status: string;
    invoice_number: string | null;
    created_at: string;
  } | null;
  downloads: Array<{
    id: string;
    product_title: string;
    token: string;
    expires_at: string;
    remaining: number;
  }>;
  invoice_signed_url: string | null;
}

interface StoredAccess {
  order_id: string;
  access_token: string;
  order_number?: string;
}

export function getStoredAccess(): StoredAccess | null {
  try {
    const raw = localStorage.getItem("pb_boutique_last_order");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAccess;
    if (!parsed.order_id || !parsed.access_token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useOrderStatus() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    // 1. URL (?order=...&token=...) — prioritaire (liens email/WhatsApp)
    let orderId = searchParams.get("order");
    let token = searchParams.get("token");

    // 2. Fallback localStorage (retour PayDunya sans token dans l'URL)
    if (!orderId || !token) {
      const stored = getStoredAccess();
      if (stored && (!orderId || stored.order_id === orderId)) {
        orderId = stored.order_id;
        token = stored.access_token;
      }
    }

    if (!orderId || !token) {
      setError("no_access");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/payment/status?order=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "unknown");
      } else {
        setData(json as OrderStatusData);
      }
    } catch {
      setError("network");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
