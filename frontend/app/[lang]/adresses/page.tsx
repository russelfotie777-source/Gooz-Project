import type { Metadata } from "next";
import AddressesPage from "@/components/AddressesPage/AddressesPage";
import AddressesDesktop from "@/components/AddressesPage/AddressesDesktop";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { robots: NOINDEX };

export default function Page() {
  return (
    <>
      <AddressesPage />
      <AddressesDesktop />
    </>
  );
}
