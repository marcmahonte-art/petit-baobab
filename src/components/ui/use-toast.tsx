// src/components/ui/use-toast.tsx
"use client";
import { toast as sonnerToast } from "sonner";

export function toast({ title, description }: { title: string; description?: string }) {
  const message = description ? `${title}: ${description}` : title;
  sonnerToast(message);
}
