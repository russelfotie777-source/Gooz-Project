"use client";

import { useEffect, useState } from "react";
import { ImageOff, Plus, Trash2, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type Banner = {
  id: number;
  title: string | null;
  image: string;
  link_url: string | null;
  position: number;
  is_active: boolean;
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    apiFetch<{ data: Banner[] }>("/admin/banners")
      .then((res) => setBanners(res.data))
      .catch(() => setError("Impossible de charger les bannières."));
  }

  useEffect(load, []);

  async function toggleActive(banner: Banner) {
    try {
      await apiFetch(`/banners/${banner.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !banner.is_active }),
      });
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
    <div className="animate-fade-in-up">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Bannières</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Bannières défilantes affichées sur la page d&apos;accueil de la boutique.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 transition-all hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Nouvelle bannière
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-xs uppercase tracking-wide text-zinc-400">
              <th className="px-5 py-3 font-medium">Image</th>
              <th className="px-5 py-3 font-medium">Titre</th>
              <th className="px-5 py-3 font-medium">Lien</th>
              <th className="px-5 py-3 font-medium">Ordre</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners?.map((banner) => (
              <tr key={banner.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60">
                <td className="px-5 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.image}
                    alt={banner.title ?? "Bannière"}
                    className="h-10 w-20 rounded-lg object-cover ring-1 ring-zinc-200"
                  />
                </td>
                <td className="px-5 py-3 font-medium text-zinc-900">{banner.title ?? "—"}</td>
                <td className="px-5 py-3 max-w-[220px] truncate text-zinc-500">
                  {banner.link_url ?? "—"}
                </td>
                <td className="px-5 py-3 text-zinc-500">{banner.position}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      banner.is_active
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                    }`}
                  >
                    {banner.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {banners?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-zinc-400">Aucune bannière pour le moment.</p>
        )}
      </div>

      {showForm && (
        <BannerFormModal
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function BannerFormModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [position, setPosition] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!image) {
      setError("L'image est obligatoire.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (title) formData.set("title", title);
      if (linkUrl) formData.set("link_url", linkUrl);
      formData.set("position", position || "0");
      formData.set("is_active", isActive ? "1" : "0");
      formData.set("image", image);

      await apiFetch("/banners", { method: "POST", body: formData });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la création.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Nouvelle bannière</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            placeholder="Titre (optionnel)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-brand-orange/60"
          />

          <input
            type="url"
            placeholder="Lien (ex: https://...)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-brand-orange/60"
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-zinc-500">Ordre d&apos;affichage</label>
              <input
                type="number"
                min={0}
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-brand-orange/60"
              />
            </div>
            <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-brand-orange focus:ring-brand-orange/40"
              />
              Active
            </label>
          </div>

          <label className="text-xs font-medium text-zinc-500">Image</label>
          <div className="flex items-center gap-3">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Aperçu" className="h-14 w-24 rounded-lg object-cover ring-1 ring-zinc-200" />
            ) : (
              <div className="flex h-14 w-24 items-center justify-center rounded-lg bg-zinc-100 text-zinc-300">
                <ImageOff className="h-5 w-5" />
              </div>
            )}
            <input
              required
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="flex-1 text-xs text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
          >
            {submitting ? "Création..." : "Créer la bannière"}
          </button>
        </form>
      </div>
    </div>
  );
}
