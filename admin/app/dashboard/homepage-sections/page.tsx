"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownWideNarrow,
  ChevronRight,
  ExternalLink,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type Section = {
  id: number;
  display_title: string;
  view_url: string;
  section_type: "automatic" | "manual" | "mixed";
  display_mode: "variants" | "products";
  automatic_strategy: string | null;
  is_active: boolean;
  position: number;
};

const STRATEGY_LABELS: Record<string, string> = {
  new_arrivals: "Nouveautés",
  best_sellers: "Meilleures ventes",
  category_showcase: "Vitrine de catégorie",
  brand_list: "Liste de marques",
  category_list: "Liste de catégories",
  price_range: "Gamme de prix",
};

const TYPE_LABELS: Record<string, string> = {
  automatic: "Automatique",
  manual: "Manuel",
  mixed: "Mixte",
};

export default function HomepageSectionsPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[] | null>(null);
  const [meta, setMeta] = useState<Paginated<Section>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);

  function load() {
    const query = new URLSearchParams({ page: String(page), per_page: "25" });
    if (search) query.set("q", search);

    apiFetch<Paginated<Section>>(`/admin/homepage-sections?${query.toString()}`)
      .then((res) => {
        setSections(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger les sections."));
  }

  useEffect(() => {
    const timeout = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  async function normalizeOrder() {
    if (!sections || sections.length === 0) return;
    setReordering(true);
    try {
      await apiFetch("/admin/homepage-sections/reorder", {
        method: "POST",
        body: JSON.stringify({ ids: sections.map((s) => s.id) }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec du réordonnancement.");
    } finally {
      setReordering(false);
    }
  }

  async function moveSection(index: number, direction: -1 | 1) {
    if (!sections) return;
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;

    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);

    try {
      await apiFetch("/admin/homepage-sections/reorder", {
        method: "POST",
        body: JSON.stringify({ ids: next.map((s) => s.id) }),
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec du réordonnancement.");
      load();
    }
  }

  async function deleteSection(id: number) {
    if (!confirm("Supprimer cette section ?")) return;
    try {
      await apiFetch(`/admin/homepage-sections/${id}`, { method: "DELETE" });
      setSections((prev) => prev?.filter((s) => s.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Sections d&apos;accueil</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sections d&apos;accueil</h1>
          <p className="mt-1 text-sm text-white/40">Sections affichées sur la page d&apos;accueil de la boutique.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/homepage-sections/create")}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Ajouter une section
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.03]">
        <div className="flex items-center justify-between gap-3 border-b border-white/5 p-4">
          <button
            onClick={normalizeOrder}
            disabled={reordering}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/5 disabled:opacity-50"
          >
            <ArrowDownWideNarrow className="h-4 w-4" />
            Normaliser l&apos;ordre
          </button>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Rechercher..."
              className="w-64 rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">Ordre</th>
              <th className="px-5 py-3 font-medium">Titre</th>
              <th className="px-5 py-3 font-medium">URL</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Stratégie</th>
              <th className="px-5 py-3 font-medium">Actif</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections?.map((section, index) => (
              <tr key={section.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-white/50">
                  <div className="flex items-center gap-1.5">
                    <span>{section.position}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveSection(index, -1)}
                        disabled={index === 0}
                        className="leading-none text-white/30 hover:text-white disabled:opacity-20"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveSection(index, 1)}
                        disabled={index === sections.length - 1}
                        className="leading-none text-white/30 hover:text-white disabled:opacity-20"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 font-medium text-white">{section.display_title}</td>
                <td className="px-5 py-3">
                  <a
                    href={section.view_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-emerald-400 hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {section.view_url}
                  </a>
                </td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-brand-orange/10 px-2.5 py-1 text-xs font-medium text-brand-orange">
                    {TYPE_LABELS[section.section_type]}
                    {section.section_type !== "manual" ? ` (${section.display_mode === "variants" ? "Variantes" : "Produits"})` : ""}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {section.automatic_strategy ? (
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-white/60">
                      {STRATEGY_LABELS[section.automatic_strategy] ?? section.automatic_strategy}
                    </span>
                  ) : (
                    <span className="text-white/30">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      section.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/40"
                    }`}
                  >
                    {section.is_active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="relative px-5 py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === section.id ? null : section.id)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === section.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-5 top-11 z-20 w-44 rounded-xl border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                        <Link
                          href={`/dashboard/homepage-sections/${section.id}/edit`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-amber-400 hover:bg-white/5"
                        >
                          <Pencil className="h-4 w-4" />
                          Modifier
                        </Link>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            deleteSection(section.id);
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

        {sections?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucune section pour le moment.</p>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 px-5 py-4">
            <p className="text-xs text-white/30">{meta.total} résultat{meta.total > 1 ? "s" : ""}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
              >
                ‹
              </button>
              <span className="text-xs font-medium text-white/60">
                {meta.current_page} / {meta.last_page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.last_page}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
