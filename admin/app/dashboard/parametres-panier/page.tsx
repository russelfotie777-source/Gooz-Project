"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type CartSetting = {
  expires_after: number;
  expires_unit: "heures" | "jours";
  updated_at: string;
};

const UNIT_LABELS: Record<CartSetting["expires_unit"], string> = {
  heures: "Heures",
  jours: "Jours",
};

export default function ParametresPanierPage() {
  const [loaded, setLoaded] = useState(false);
  const [expiresAfter, setExpiresAfter] = useState("");
  const [expiresUnit, setExpiresUnit] = useState<CartSetting["expires_unit"]>("jours");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiFetch<{ data: CartSetting }>("/admin/cart-settings")
      .then((res) => {
        setExpiresAfter(String(res.data.expires_after));
        setExpiresUnit(res.data.expires_unit);
        setUpdatedAt(res.data.updated_at);
        setLoaded(true);
      })
      .catch(() => setError("Impossible de charger la configuration du panier."));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const res = await apiFetch<{ data: CartSetting }>("/admin/cart-settings", {
        method: "PUT",
        body: JSON.stringify({
          expires_after: Number(expiresAfter),
          expires_unit: expiresUnit,
        }),
      });
      setUpdatedAt(res.data.updated_at);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Paramètres panier</span>
        <ChevronRight className="h-3 w-3" />
        <span>Configuration</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Paramètres panier</h1>
        <p className="mt-1 text-sm text-white/40">
          Délai après lequel un panier inactif est considéré comme expiré.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Configuration enregistrée.
        </p>
      )}

      {!loaded ? (
        <p className="text-white/40">Chargement...</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Expire après</label>
                <input
                  required
                  type="number"
                  min={1}
                  step="1"
                  value={expiresAfter}
                  onChange={(e) => setExpiresAfter(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Unité</label>
                <select
                  value={expiresUnit}
                  onChange={(e) => setExpiresUnit(e.target.value as CartSetting["expires_unit"])}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60"
                >
                  {Object.entries(UNIT_LABELS).map(([value, label]) => (
                    <option key={value} value={value} className="bg-[#12141c]">
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
            >
              {submitting ? "..." : "Enregistrer"}
            </button>
            {updatedAt && (
              <p className="text-xs text-white/30">
                Dernière modification : {new Date(updatedAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
