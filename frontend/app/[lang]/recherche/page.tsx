import SearchPage from "@/components/SearchPage/SearchPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return <SearchPage query={q ?? ""} />;
}
