import type { Metadata } from "next";
import CartPage from "@/components/CartPage/CartPage";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { robots: NOINDEX };

export default function Page() {
  return <CartPage />;
}
