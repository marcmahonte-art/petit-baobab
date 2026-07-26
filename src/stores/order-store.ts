"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Order, MOCK_ORDERS } from "@/lib/mock/orders";

interface OrderStore {
  currentOrder: Order | null;
  ordersHistory: Order[];
  createOrder: (orderData: Omit<Order, "order_number" | "date" | "status">) => Order;
  setCurrentOrder: (order: Order) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      currentOrder: MOCK_ORDERS[0],
      ordersHistory: [...MOCK_ORDERS],

      createOrder: (orderData) => {
        const order_number = `PB-${new Date().getFullYear()}-${Math.floor(
          10000 + Math.random() * 90000
        )}`;

        const date = new Date().toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const newOrder: Order = {
          ...orderData,
          order_number,
          date,
          status: "pending",
        };

        set((state) => ({
          currentOrder: newOrder,
          ordersHistory: [newOrder, ...state.ordersHistory],
        }));

        return newOrder;
      },

      setCurrentOrder: (order) => set({ currentOrder: order }),
    }),
    {
      name: "pb_boutique_orders",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
