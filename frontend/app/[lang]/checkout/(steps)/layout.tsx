import { CheckoutProvider } from "@/components/Checkout/CheckoutContext";

// CheckoutProvider fetches the real cart itself (client-side, needs the
// localStorage token) and keeps form/selection state alive across the 4
// mobile checkout routes via client-side navigation.
export default function CheckoutStepsLayout({ children }: { children: React.ReactNode }) {
  return <CheckoutProvider>{children}</CheckoutProvider>;
}
