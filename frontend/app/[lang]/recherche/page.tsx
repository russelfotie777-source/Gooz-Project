import type { Metadata } from "next";
import SearchPage from "@/components/SearchPage/SearchPage";

// Results vary per query with no stable content of their own — standard
// practice is index:false (avoids thin/duplicate-content pages piling up in
// the index) while still following links out to the actual product pages.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return <SearchPage query={q ?? ""} />;
}
