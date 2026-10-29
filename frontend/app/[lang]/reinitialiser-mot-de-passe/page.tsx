import type { Metadata } from "next";
import ResetPasswordPage from "@/components/Auth/ResetPasswordPage";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { robots: NOINDEX };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; phone?: string }>;
}) {
  const { token, phone } = await searchParams;

  return <ResetPasswordPage token={token ?? ""} phone={phone ?? ""} />;
}
