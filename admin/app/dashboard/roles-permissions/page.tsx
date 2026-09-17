"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type RolePermissionsResponse = {
  roles: string[];
  permissions: string[];
  granted: Record<string, string[]>;
};

const ROLE_LABELS: Record<string, string> = {
  manager: "Manager",
  staff: "Staff",
  stagiaire: "Stagiaire",
  comptable: "Comptable",
};

const PERMISSION_LABELS: Record<string, string> = {
  "manage-products": "Gérer les produits",
  "manage-orders": "Gérer les commandes",
  "manage-deliveries": "Gérer les livraisons",
  "moderate-reviews": "Modérer les avis",
  "manage-users": "Gérer les utilisateurs",
  "manage-coupons": "Gérer les coupons",
  "view-stats": "Voir les statistiques",
  "manage-warehouses": "Gérer les entrepôts",
  "manage-suppliers": "Gérer les fournisseurs",
  "manage-stock-adjustments": "Gérer les ajustements de stock",
  "view-inventory-ledger": "Voir le journal d'inventaire",
  "manage-delivery-settings": "Gérer les paramètres de livraison",
  "manage-cart-settings": "Gérer les paramètres du panier",
  "manage-neighborhoods": "Gérer les quartiers de livraison",
  "manage-homepage-sections": "Gérer les sections d'accueil",
  "manage-accounting": "Gérer la comptabilité",
  "manage-company-profile": "Gérer le profil entreprise",
  "manage-announcements": "Gérer les annonces",
  "manage-app-promo": "Gérer le widget de téléchargement app",
};

export default function RolesPermissionsPage() {
  const [data, setData] = useState<RolePermissionsResponse | null>(null);
  const [role, setRole] = useState<string>("manager");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    apiFetch<RolePermissionsResponse>("/admin/role-permissions")
      .then((res) => {
        setData(res);
        setSelected(new Set(res.granted[role] ?? []));
      })
      .catch(() => setError("Impossible de charger les permissions."));
  }

  useEffect(load, []);

  function selectRole(newRole: string) {
    setRole(newRole);
    setSelected(new Set(data?.granted[newRole] ?? []));
    setSuccess(false);
  }

  function toggle(permission: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return next;
    });
  }

  async function handleSave() {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await apiFetch("/admin/role-permissions", {
        method: "PUT",
        body: JSON.stringify({ role, permissions: Array.from(selected) }),
      });
      setData((prev) => (prev ? { ...prev, granted: { ...prev.granted, [role]: Array.from(selected) } } : prev));
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
        <span>Roles & Permissions</span>
        <ChevronRight className="h-3 w-3" />
        <span>Configuration</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <p className="mt-1 text-sm text-white/40">
          Accès accordé à chaque rôle. Admin et Super admin ont toujours accès à tout.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Permissions enregistrées.
        </p>
      )}

      {!data ? (
        <p className="text-white/40">Chargement...</p>
      ) : (
        <>
          <div className="mb-6 flex gap-2">
            {data.roles.map((r) => (
              <button
                key={r}
                onClick={() => selectRole(r)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  role === r
                    ? "bg-gradient-to-r from-brand-orange to-brand-orange-dark text-white shadow-lg shadow-brand-orange/20"
                    : "border border-white/10 text-white/60 hover:bg-white/5"
                }`}
              >
                {ROLE_LABELS[r] ?? r}
              </button>
            ))}
          </div>

          <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.permissions.map((permission) => (
                <label
                  key={permission}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.03]"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(permission)}
                    onChange={() => toggle(permission)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 accent-brand-orange"
                  />
                  <span className="text-sm text-white/80">{PERMISSION_LABELS[permission] ?? permission}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={submitting}
            className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
          >
            {submitting ? "..." : "Enregistrer"}
          </button>
        </>
      )}
    </div>
  );
}
