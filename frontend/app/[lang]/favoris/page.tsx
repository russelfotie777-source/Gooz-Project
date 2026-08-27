import type { Metadata } from "next";
import FavoritesPage from "@/components/FavoritesPage/FavoritesPage";
import FavoritesDesktop from "@/components/FavoritesPage/FavoritesDesktop";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { robots: NOINDEX };

export default function Page() {
  return (
    <>
      <FavoritesPage />
      <FavoritesDesktop />
    </>
  );
}
