"use client";

import { useEffect, useState } from "react";
import { ImageOff, Plus, Trash2, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  image: string | null;
  is_active: boolean;
  children: Category[];
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    apiFetch<{ data: Category[] }>("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setError("Impossible de charger les catégories."));
  }

  useEffect(load, []);

  async function deleteCategory(id: number) {
    if (!confirm("Supprimer cette catégorie ?")) return;
    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev?.filter((c) => c.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Catégories</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Arborescence des catégories actives du catalogue.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 transition-all hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Nouvelle catégorie
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
              <th className="px-5 py-3 font-medium">Nom</th>
              <th className="px-5 py-3 font-medium">Sous-catégories</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((cat) => (
              <tr key={cat.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60">
                <td className="px-5 py-3">
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-10 w-10 rounded-lg object-cover ring-1 ring-zinc-200"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-300">
                      <ImageOff className="h-4 w-4" />
                    </div>
                  )}
                </td>
                <td className="px-5 py-3">
                  <p className="font-medium text-zinc-900">{cat.name}</p>
                  <p className="font-mono text-xs text-zinc-400">{cat.slug}</p>
                </td>
                <td className="px-5 py-3 text-zinc-500">
                  {cat.children.length > 0 ? cat.children.map((c) => c.name).join(", ") : "—"}
                </td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    Active
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-zinc-400">Aucune catégorie.</p>
        )}
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        Seules les catégories actives sont affichées — l&apos;API publique ne remonte pas encore les
        catégories désactivées.
      </p>

      {showForm && categories && (
        <CategoryFormModal
          parents={categories}
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

function CategoryFormModal({
  parents,
  onClose,
  onCreated,
}: {
  parents: Category[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
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
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("name", name);
      if (parentId) formData.set("parent_id", parentId);
      formData.set("is_active", "1");
      if (image) formData.set("image", image);

      await apiFetch("/categories", { method: "POST", body: formData });
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
          <h2 className="text-lg font-semibold text-zinc-900">Nouvelle catégorie</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            required
            placeholder="Nom de la catégorie"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-brand-orange/60"
          />

          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 outline-none focus:border-brand-orange/60"
          >
            <option value="">Aucune catégorie parente</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <label className="text-xs font-medium text-zinc-500">Image (optionnel)</label>
          <div className="flex items-center gap-3">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Aperçu" className="h-14 w-14 rounded-lg object-cover ring-1 ring-zinc-200" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-zinc-100 text-zinc-300">
                <ImageOff className="h-5 w-5" />
              </div>
            )}
            <input
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
            {submitting ? "Création..." : "Créer la catégorie"}
          </button>
        </form>
      </div>
    </div>
  );
}
