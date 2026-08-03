"use client";

import { useEffect, useState } from "react";
import { Check, Star, Trash2 } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";

type Review = {
  id: number;
  user: { id: number; name: string } | null;
  product_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
};

export default function AvisPage() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    apiFetch<Paginated<Review>>("/admin/reviews")
      .then((res) => setReviews(res.data))
      .catch(() => setError("Impossible de charger les avis."));
  }

  useEffect(load, []);

  async function approve(id: number) {
    setBusyId(id);
    try {
      await apiFetch(`/admin/reviews/${id}/approve`, { method: "PATCH" });
      setReviews((prev) => prev?.filter((r) => r.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'approbation.");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: number) {
    if (!confirm("Supprimer définitivement cet avis ?")) return;
    setBusyId(id);
    try {
      await apiFetch(`/admin/reviews/${id}`, { method: "DELETE" });
      setReviews((prev) => prev?.filter((r) => r.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Avis à modérer</h1>
        <p className="mt-1 text-sm text-zinc-500">Avis clients en attente d&apos;approbation.</p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {reviews?.length === 0 && (
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-zinc-400">Aucun avis en attente de modération.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {reviews?.map((review) => (
          <div
            key={review.id}
            className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
          >
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-medium text-zinc-900">{review.user?.name ?? "Client"}</span>
                <span className="text-xs text-zinc-400">
                  Produit #{review.product_id} · {new Date(review.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="mb-2 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? "fill-brand-orange text-brand-orange" : "text-zinc-200"
                    }`}
                  />
                ))}
              </div>
              {review.comment && <p className="text-sm text-zinc-600">{review.comment}</p>}
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => approve(review.id)}
                disabled={busyId === review.id}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                Approuver
              </button>
              <button
                onClick={() => reject(review.id)}
                disabled={busyId === review.id}
                className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
