import { CheckoutProvider } from "@/components/Checkout/CheckoutContext";
import CheckoutDesktopPage from "@/components/Checkout/CheckoutDesktopPage";

// Figma desktop node 1669:2379 / 1679:3412 / 1680:3770 — single accordion
// page (unlike the 4 separate mobile routes under app/checkout/(steps)/).
// CheckoutProvider fetches the real cart itself (client-side, needs the
// localStorage token), so this shell needs no server data fetching.
export default function Page() {
  return (
    <CheckoutProvider>
      <CheckoutDesktopPage />
    </CheckoutProvider>
  );
}
