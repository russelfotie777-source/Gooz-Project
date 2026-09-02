import type { Metadata } from "next";
import PaymentHistoryPage from "@/components/PaymentHistoryPage/PaymentHistoryPage";
import PaymentHistoryDesktop from "@/components/PaymentHistoryPage/PaymentHistoryDesktop";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { robots: NOINDEX };

export default function Page() {
  return (
    <>
      <PaymentHistoryPage />
      <PaymentHistoryDesktop />
    </>
  );
}
