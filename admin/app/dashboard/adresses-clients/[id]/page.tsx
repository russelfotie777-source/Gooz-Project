"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";

type AddressDetail = {
  id: number;
  customer_name: string | null;
  customer_phone: string | null;
  label: string | null;
  recipient_name: string;
  recipient_phone: string;
  country: string;
  region: string | null;
  ville: string;
  quartier: string | null;
  address_line: string | null;
  postal_code: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "medium" });
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

export default function AddressDetailPage() {
  const params = useParams<{ id: string }>();
  const addressId = Number(params.id);

  const [address, setAddress] = useState<AddressDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: AddressDetail }>(`/admin/addresses/${addressId}`)
      .then((res) => setAddress(res.data))
      .catch(() => setError("Impossible de charger cette adresse."));
  }, [addressId]);

  if (!address) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-red-300">{error}</p> : <p className="text-white/40">Chargement...</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/adresses-clients" className="hover:text-white/70">
          Adresses clients
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{address.label ?? address.recipient_name}</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">{address.label ?? address.recipient_name}</h1>

      <Section title="Aperçu">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Libellé">
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70">
              {address.label ?? "—"}
            </span>
          </Field>
          <Field label="Nom du destinataire">{address.recipient_name}</Field>
          <Field label="Téléphone du destinataire">{address.recipient_phone}</Field>
          <Field label="Adresse par défaut">
            {address.is_default ? (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                Par défaut
              </span>
            ) : (
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-white/40">Non</span>
            )}
          </Field>
          <Field label="Pays">{address.country}</Field>
          <Field label="Ville">{address.ville}</Field>
        </div>
      </Section>

      <Section title="Détails de l'adresse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="État / Région">{address.region || "Indisponible"}</Field>
          <Field label="Code postal">{address.postal_code || "Indisponible"}</Field>
          <Field label="Adresse">{address.address_line || "Indisponible"}</Field>
          <Field label="Point de repère / Notes">{address.quartier || "Indisponible"}</Field>
        </div>
      </Section>

      <Section title="Client">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Nom du client">{address.customer_name || "—"}</Field>
          <Field label="Téléphone du compte">{address.customer_phone || "—"}</Field>
        </div>
      </Section>

      <Section title="Workflow">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Créée le">{formatDate(address.created_at)}</Field>
          <Field label="Mise à jour le">{formatDate(address.updated_at)}</Field>
        </div>
      </Section>
    </div>
  );
}
