"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Pencil } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Neighborhood = {
  id: number;
  city: { id: number; name: string } | null;
  name: string;
  latitude: string;
  longitude: string;
  created_at: string;
  updated_at: string;
};

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

export default function NeighborhoodDetailPage() {
  const params = useParams<{ id: string }>();
  const neighborhoodId = Number(params.id);

  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Neighborhood }>(`/admin/neighborhoods/${neighborhoodId}`)
      .then((res) => setNeighborhood(res.data))
      .catch(() => setError("Impossible de charger ce quartier."));
  }, [neighborhoodId]);

  if (!neighborhood) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-red-300">{error}</p> : <p className="text-white/40">Chargement...</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/quartiers-livraison" className="hover:text-white/70">
          Quartiers de livraison
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Voir</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{neighborhood.name}</h1>
        <Link
          href={`/dashboard/quartiers-livraison/${neighborhood.id}/edit`}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-white/5"
        >
          <Pencil className="h-4 w-4" />
          Modifier
        </Link>
      </div>

      <Section title="Informations">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Ville">{neighborhood.city?.name ?? "—"}</Field>
          <Field label="Latitude">{neighborhood.latitude}</Field>
          <Field label="Longitude">{neighborhood.longitude}</Field>
          <Field label="Créé le">{formatDate(neighborhood.created_at)}</Field>
          <Field label="Mis à jour le">{formatDate(neighborhood.updated_at)}</Field>
        </div>
      </Section>
    </div>
  );
}
