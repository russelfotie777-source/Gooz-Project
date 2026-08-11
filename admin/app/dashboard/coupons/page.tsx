"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { apiFetch, ApiError, Paginated } from "@/lib/api";
import { Pager } from "@/components/pager";

type Coupon = {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [meta, setMeta] = useState<Paginated<Coupon>["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    apiFetch<Paginated<Coupon>>(`/admin/coupons?page=${page}`)
      .then((res) => {
        setCoupons(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError("Impossible de charger les coupons."));
  }

  useEffect(load, [page]);

  async function toggleActive(coupon: Coupon) {
    try {
      await apiFetch(`/admin/coupons/${coupon.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !coupon.is_active }),
      });
      setCoupons(
        (prev) => prev?.map((c) => (c.id === coupon.id ? { ...c, is_active: !c.is_active } : c)) ?? null
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    }
  }

  async function deleteCoupon(id: number) {
    if (!confirm("Supprimer ce coupon ?")) return;
    try {
      await apiFetch(`/admin/coupons/${id}`, { method: "DELETE" });
      setCoupons((prev) => prev?.filter((c) => c.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Coupons</h1>
          <p className="mt-1 text-sm text-zinc-500">Codes promotionnels de la boutique.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 transition-all hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Nouveau coupon
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
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Réduction</th>
              <th className="px-5 py-3 font-medium">Utilisations</th>
              <th className="px-5 py-3 font-medium">Expire le</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons?.map((coupon) => (
              <tr key={coupon.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60">
                <td className="px-5 py-3 font-mono text-xs font-semibold text-zinc-900">{coupon.code}</td>
                <td className="px-5 py-3 text-zinc-600">
                  {coupon.type === "percentage" ? `${coupon.value}%` : `${coupon.value} XAF`}
                </td>
                <td className="px-5 py-3 text-zinc-500">
                  {coupon.used_count}
                  {coupon.max_uses ? ` / ${coupon.max_uses}` : ""}
                </td>
                <td className="px-5 py-3 text-zinc-400">
                  {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleActive(coupon)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      coupon.is_active
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                    }`}
                  >
                    {coupon.is_active ? "Actif" : "Inactif"}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => deleteCoupon(coupon.id)}
                    className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {coupons?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-zinc-400">Aucun coupon pour le moment.</p>
        )}

        {meta && (
          <div className="px-5 py-4">
            <Pager page={meta.current_page} lastPage={meta.last_page} total={meta.total} onChange={setPage} />
          </div>
        )}
      </div>

      {showForm && (
        <CouponFormModal
          onClose={() => setShowForm(false)}
          onCreated={(coupon) => {
            setCoupons((prev) => (prev ? [coupon, ...prev] : [coupon]));
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function CouponFormModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (coupon: Coupon) => void;
}) {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const coupon = await apiFetch<{ data: Coupon }>("/admin/coupons", {
        method: "POST",
        body: JSON.stringify({
          code,
          type,
          value: Number(value),
          min_order_amount: minOrder ? Number(minOrder) : null,
          max_uses: maxUses ? Number(maxUses) : null,
          expires_at: expiresAt || null,
          is_active: true,
        }),
      });
      onCreated(coupon.data);
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
          <h2 className="text-lg font-semibold text-zinc-900">Nouveau coupon</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            required
            placeholder="Code (ex: WELCOME10)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-brand-orange/60"
          />
          <div className="flex gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "percentage" | "fixed")}
              className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-brand-orange/60"
            >
              <option value="percentage">Pourcentage</option>
              <option value="fixed">Montant fixe</option>
            </select>
            <input
              required
              type="number"
              step="0.01"
              placeholder="Valeur"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-brand-orange/60"
            />
          </div>
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Montant min. (XAF)"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-brand-orange/60"
            />
            <input
              type="number"
              placeholder="Utilisations max."
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-brand-orange/60"
            />
          </div>
          <label className="text-xs font-medium text-zinc-500">Date d&apos;expiration (optionnel)</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-brand-orange/60"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
          >
            {submitting ? "Création..." : "Créer le coupon"}
          </button>
        </form>
      </div>
    </div>
  );
}
