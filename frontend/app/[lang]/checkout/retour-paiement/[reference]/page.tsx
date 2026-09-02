import type { Metadata } from "next";
import PaymentReturnPage from "@/components/Checkout/PaymentReturnPage";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { robots: NOINDEX };

export default async function Page({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;

  return <PaymentReturnPage reference={reference} />;
}
