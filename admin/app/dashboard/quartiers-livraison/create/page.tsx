"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { NeighborhoodForm, CityOption } from "@/components/neighborhood-form";

export default function CreateNeighborhoodPage() {
  const router = useRouter();
  const [cities, setCities] = useState<CityOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    apiFetch<{ data: CityOption[] }>("/cities")
      .then((res) => setCities(res.data))
      .catch(() => {});
  }, []);

  async function handleSubmit(values: Record<string, unknown>, addAnother: boolean) {
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/admin/neighborhoods", { method: "POST", body: JSON.stringify(values) });
      if (addAnother) {
        setFormKey((k) => k + 1);
      } else {
        router.push("/dashboard/quartiers-livraison");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la création.");
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
        <span>Créer</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Créer un quartier</h1>

      <NeighborhoodForm
        key={formKey}
        cities={cities}
        submitting={submitting}
        error={error}
        showAddAnother
        submitLabel="Créer"
        onCancel={() => router.push("/dashboard/quartiers-livraison")}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
