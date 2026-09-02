"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type Banner = {
  id: number;
  title: string | null;
  image: string;
  location: "homepage" | "homepage_ad_1" | "homepage_ad_2" | "category" | "search" | "checkout";
  position: number;
  is_active: boolean;
};

const LOCATION_LABELS: Record<Banner["location"], string> = {
  homepage: "Accueil — carrousel",
  homepage_ad_1: "Accueil — latérale 1",
  homepage_ad_2: "Accueil — latérale 2",
  category: "Page catégorie",
  search: "Recherche",
  checkout: "Paiement",
};

export default function BannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  function load() {
    apiFetch<{ data: Banner[] }>("/admin/banners")
      .then((res) => setBanners(res.data))
      .catch(() => setError("Impossible de charger les bannières."));
  }

  useEffect(load, []);

  async function toggleActive(banner: Banner) {
    try {
      const formData = new FormData();
      formData.set("_method", "PUT");
      formData.set("is_active", banner.is_active ? "0" : "1");
      await apiFetch(`/banners/${banner.id}`, { method: "POST", body: formData });
      setBanners(
        (prev) => prev?.map((b) => (b.id === banner.id ? { ...b, is_active: !b.is_active } : b)) ?? null
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    }
  }

  async function deleteBanner(id: number) {
    if (!confirm("Supprimer cette bannière ?")) return;
    try {
      await apiFetch(`/banners/${id}`, { method: "DELETE" });
      setBanners((prev) => prev?.filter((b) => b.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Bannières</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bannières</h1>
          <p className="mt-1 text-sm text-white/40">
            Bannières promotionnelles affichées dans la boutique.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/bannieres/create")}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Ajouter une bannière
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">Image</th>
              <th className="px-5 py-3 font-medium">Titre</th>
              <th className="px-5 py-3 font-medium">Emplacement</th>
              <th className="px-5 py-3 font-medium">Actif</th>
              <th className="px-5 py-3 font-medium">Ordre</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners?.map((banner) => (
              <tr key={banner.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.image}
                    alt={banner.title ?? "Bannière"}
                    className="h-10 w-20 rounded-lg object-cover ring-1 ring-white/10"
                  />
                </td>
                <td className="px-5 py-3 font-medium text-white">{banner.title ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-brand-orange/10 px-2.5 py-1 text-xs font-medium text-brand-orange">
                    {LOCATION_LABELS[banner.location]}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      banner.is_active ? "bg-brand-orange" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        banner.is_active ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-5 py-3 text-white/50">{banner.position}</td>
                <td className="relative px-5 py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === banner.id ? null : banner.id)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === banner.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-5 top-11 z-20 w-44 rounded-xl border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                        <Link
                          href={`/dashboard/bannieres/${banner.id}/edit`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-amber-400 hover:bg-white/5"
                        >
                          <Pencil className="h-4 w-4" />
                          Modifier
                        </Link>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            deleteBanner(banner.id);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {banners?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucune bannière pour le moment.</p>
        )}
      </div>
    </div>
  );
}
