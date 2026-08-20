import CheckoutConfirmationVerified from "@/components/Checkout/CheckoutConfirmationVerified";

// The order reference lives in the URL itself (not just sessionStorage/
// context) so a refresh, a bookmark, or a shared link all still show the
// right confirmation — see CheckoutPaymentStep's redirect. But a URL segment
// is also something anyone can type or edit, so CheckoutConfirmationVerified
// checks the reference against the backend (ownership + existence) before
// showing the success screen for it.
export default async function Page({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;

  return <CheckoutConfirmationVerified reference={decodeURIComponent(reference)} />;
}
