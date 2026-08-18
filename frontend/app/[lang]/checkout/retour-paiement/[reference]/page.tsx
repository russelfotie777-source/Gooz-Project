import PaymentReturnPage from "@/components/Checkout/PaymentReturnPage";

export default async function Page({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;

  return <PaymentReturnPage reference={reference} />;
}
