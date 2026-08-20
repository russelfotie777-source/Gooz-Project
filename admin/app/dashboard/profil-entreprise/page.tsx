"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type CompanyProfile = {
  name: string;
  support_email: string;
  support_phone: string;
  country: string;
  updated_at: string;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-orange/60";

export default function ProfilEntreprisePage() {
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [country, setCountry] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiFetch<{ data: CompanyProfile }>("/admin/company-profile")
      .then((res) => {
        setName(res.data.name);
        setSupportEmail(res.data.support_email);
        setSupportPhone(res.data.support_phone);
        setCountry(res.data.country);
        setUpdatedAt(res.data.updated_at);
        setLoaded(true);
      })
      .catch(() => setError("Impossible de charger le profil entreprise."));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const res = await apiFetch<{ data: CompanyProfile }>("/admin/company-profile", {
        method: "PUT",
        body: JSON.stringify({
          name,
          support_email: supportEmail,
          support_phone: supportPhone,
          country,
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
        <span>Profil entreprise</span>
        <ChevronRight className="h-3 w-3" />
        <span>Configuration</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profil entreprise</h1>
        <p className="mt-1 text-sm text-white/40">Identité et coordonnées de support de la boutique.</p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Profil enregistré.
        </p>
      )}

      {!loaded ? (
        <p className="text-white/40">Chargement...</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Nom de l&apos;entreprise</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Pays</label>
                <input required value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Email support</label>
                <input
                  required
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Téléphone support</label>
                <input
                  required
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className={inputClass}
                />
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
