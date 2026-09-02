import type { Metadata } from "next";
import OrderHistoryPage from "@/components/OrderHistoryPage/OrderHistoryPage";
import OrderHistoryDesktop from "@/components/OrderHistoryPage/OrderHistoryDesktop";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { robots: NOINDEX };

export default function Page() {
  return (
    <>
      <OrderHistoryPage />
      <OrderHistoryDesktop />
    </>
  );
}
