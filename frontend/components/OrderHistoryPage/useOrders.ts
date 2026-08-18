"use client";

import { useEffect, useState } from "react";
import { getOrders } from "@/lib/api";
import { getSession } from "@/lib/auth";
import type { Order } from "@/lib/types";

// Shared by OrderHistoryPage (mobile) and OrderHistoryDesktop: the
// customer's own order history, backed by GET /orders (auth required, same
// session-token pattern as the cart/addresses/tickets APIs).
export function useOrders() {
  const [status, setStatus] = useState<"loading" | "loggedOut" | "ready" | "error">("loading");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      setStatus("loggedOut");
      return;
    }

    getOrders(session.token)
      .then((list) => {
        setOrders(list);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return { status, orders };
}
