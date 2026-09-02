// Shared by every page.tsx that reads a ?page= search param server-side
// (home catalogue, category results, search results) and by the matching
// client components that write it back — centralized so "what counts as a
// valid page number" can't drift between the two sides.
export function parsePageParam(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}
