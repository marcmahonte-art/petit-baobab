export type StoreOrderStatus = "pending" | "completed" | "cancelled";
export type StorePaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded";

export interface StoreOrderItem {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  filePath?: string;
  image?: string;
}

export interface StoreOrder {
  id: string;
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  items: StoreOrderItem[];
  total: number;
  total_ht: number;
  currency: string;
  payment_method: string;
  payment_status: StorePaymentStatus;
  status: StoreOrderStatus;
  invoice_number: string | null;
  invoice_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoreDownload {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  file_path: string;
  token: string;
  expires_at: string;
  max_downloads: number;
  download_count: number;
  created_at: string;
}

export interface StoreCustomerProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  language: "fr" | "en";
  newsletter_enabled: boolean;
  whatsapp_enabled: boolean;
  email_notifications: boolean;
  whatsapp_notifications: boolean;
  download_notifications: boolean;
  privacy_analytics: boolean;
}

export interface StoreReview {
  id: string;
  user_id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  rating: number;
  comment: string | null;
  photos: string[];
  status: "pending" | "published" | "hidden";
  created_at: string;
  updated_at: string;
}

export interface StoreWishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product_title: string;
  product_image: string | null;
  product_price: number | null;
  created_at: string;
}
