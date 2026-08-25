import type { Metadata } from "next";
import AuthMobileFlow from "@/components/Auth/AuthMobileFlow";
import AuthDesktopPage from "@/components/Auth/AuthDesktopPage";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { robots: NOINDEX };

export default function Page() {
  return (
    <>
      <AuthMobileFlow initialMode="login" />
      <AuthDesktopPage mode="login" />
    </>
  );
}
