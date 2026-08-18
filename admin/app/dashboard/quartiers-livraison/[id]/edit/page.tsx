"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { NeighborhoodForm, CityOption } from "@/components/neighborhood-form";

type Neighborhood = {
  id: number;
  city_id: number;
  name: string;
  latitude: string;
  longitude: string;
};

export default function EditNeighborhoodPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const neighborhoodId = Number(params.id);

  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Neighborhood }>(`/admin/neighborhoods/${neighborhoodId}`)
      .then((res) => setNeighborhood(res.data))
      .catch(() => setError("Impossible de charger ce quartier."));
    apiFetch<{ data: CityOption[] }>("/cities")
      .then((res) => setCities(res.data))
      .catch(() => {});
  }, [neighborhoodId]);

  async function handleSubmit(values: Record<string, unknown>) {
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch(`/admin/neighborhoods/${neighborhoodId}`, { method: "PUT", body: JSON.stringify(values) });
      router.push("/dashboard/quartiers-livraison");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/quartiers-livraison" className="hover:text-white/70">
          Quartiers de livraison
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Modifier</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Modifier le quartier</h1>

      {error && !neighborhood && <p className="text-sm text-red-400">{error}</p>}

      {neighborhood && (
        <NeighborhoodForm
          cities={cities}
          initial={{
            city_id: String(neighborhood.city_id),
            name: neighborhood.name,
            latitude: String(neighborhood.latitude),
            longitude: String(neighborhood.longitude),
          }}
          submitting={submitting}
          error={error}
          submitLabel="Enregistrer"
          onCancel={() => router.push("/dashboard/quartiers-livraison")}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
