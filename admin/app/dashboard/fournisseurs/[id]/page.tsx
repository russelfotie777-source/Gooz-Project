"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Supplier = {
  id: number;
  company_name: string;
  contact_name: string;
  email: string | null;
  phone: string;
  pays: string;
  numero_fiscal: string | null;
  adresse: string;
  notes: string | null;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const TYPE_LABELS: Record<string, string> = {
  local: "Local",
  international: "International",
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

export default function SupplierDetailPage() {
  const params = useParams<{ id: string }>();
  const supplierId = Number(params.id);

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Supplier }>(`/admin/suppliers/${supplierId}`)
      .then((res) => setSupplier(res.data))
      .catch(() => setError("Impossible de charger ce fournisseur."));
  }, [supplierId]);

  if (!supplier) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-red-300">{error}</p> : <p className="text-white/40">Chargement...</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/fournisseurs" className="hover:text-white/70">
          Fournisseurs
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Voir</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">{supplier.company_name}</h1>

      <Section title="Informations fournisseur">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Personne de contact">{supplier.contact_name}</Field>
          <Field label="Téléphone">{supplier.phone}</Field>
          <Field label="E-mail">{supplier.email ?? "Non disponible"}</Field>
          <Field label="Pays">{supplier.pays}</Field>
          <Field label="Numéro fiscal">{supplier.numero_fiscal ?? "Non disponible"}</Field>
          <Field label="Type">
            <span className="rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400">
              {TYPE_LABELS[supplier.type] ?? supplier.type}
            </span>
          </Field>
          <div className="sm:col-span-3">
            <Field label="Adresse">{supplier.adresse}</Field>
          </div>
          {supplier.notes && (
            <div className="sm:col-span-3">
              <Field label="Notes">{supplier.notes}</Field>
            </div>
          )}
        </div>
      </Section>

      <Section title="Workflow">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Actif">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                supplier.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/50"
              }`}
            >
              {supplier.is_active ? "Actif" : "Inactif"}
            </span>
          </Field>
          <Field label="Créé le">{formatDate(supplier.created_at)}</Field>
          <Field label="Mis à jour le">{formatDate(supplier.updated_at)}</Field>
        </div>
      </Section>
    </div>
  );
}
