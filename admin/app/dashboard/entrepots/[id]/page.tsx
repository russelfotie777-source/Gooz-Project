"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Warehouse = {
  id: number;
  name: string;
  type: string;
  code: string | null;
  region: string;
  pays: string;
  ville: string;
  quartier: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  responsible_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const TYPE_LABELS: Record<string, string> = {
  entrepot: "Entrepôt",
  boutique: "Boutique",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <h2 className="mb-5 text-sm font-semibold text-white/70">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <div className="mt-1 text-sm text-white">{children}</div>
    </div>
  );
}

export default function WarehouseDetailPage() {
  const params = useParams<{ id: string }>();
  const warehouseId = Number(params.id);

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Warehouse }>(`/admin/warehouses/${warehouseId}`)
      .then((res) => setWarehouse(res.data))
      .catch(() => setError("Impossible de charger cet emplacement."));
  }, [warehouseId]);

  if (!warehouse) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-red-300">{error}</p> : <p className="text-white/40">Chargement...</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/entrepots" className="hover:text-white/70">
          Emplacements
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Voir</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">{warehouse.name}</h1>

      <Section title="Aperçu">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Code">{warehouse.code ?? "Non disponible"}</Field>
          <Field label="Type">
            <span className="rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400">
              {TYPE_LABELS[warehouse.type] ?? warehouse.type}
            </span>
          </Field>
          <Field label="Responsable">{warehouse.responsible_name ?? "Non disponible"}</Field>
          <Field label="Pays">{warehouse.pays ?? "Non disponible"}</Field>
          <Field label="Région">{warehouse.region}</Field>
          <Field label="Ville">{warehouse.ville}</Field>
          <Field label="Quartier">{warehouse.quartier ?? "Non disponible"}</Field>
          <Field label="Téléphone">{warehouse.phone ?? "Non disponible"}</Field>
          <Field label="Coordonnées">
            {warehouse.latitude}, {warehouse.longitude}
          </Field>
        </div>
      </Section>

      <Section title="Workflow">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Actif">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                warehouse.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/50"
              }`}
            >
              {warehouse.is_active ? "Actif" : "Inactif"}
            </span>
          </Field>
          <Field label="Créé le">{formatDate(warehouse.created_at)}</Field>
          <Field label="Mis à jour le">{formatDate(warehouse.updated_at)}</Field>
        </div>
      </Section>
    </div>
  );
}
