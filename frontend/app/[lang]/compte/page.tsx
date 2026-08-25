import type { Metadata } from "next";
import ProfilePage from "@/components/ProfilePage/ProfilePage";
import ProfileDesktop from "@/components/ProfilePage/ProfileDesktop";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { robots: NOINDEX };

export default function Page() {
  return (
    <>
      <ProfilePage />
      <ProfileDesktop />
    </>
  );
}
