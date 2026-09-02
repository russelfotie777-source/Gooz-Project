import type { Metadata } from "next";
import NotificationsPage from "@/components/NotificationsPage/NotificationsPage";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { robots: NOINDEX };

export default function Page() {
  return <NotificationsPage />;
}
