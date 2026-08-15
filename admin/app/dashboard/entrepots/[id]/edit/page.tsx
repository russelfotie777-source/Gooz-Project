"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { WarehouseForm } from "@/components/warehouse-form";

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
};

export default function EditWarehousePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const warehouseId = Number(params.id);

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Warehouse }>(`/admin/warehouses/${warehouseId}`)
      .then((res) => setWarehouse(res.data))
      .catch(() => setError("Impossible de charger cet emplacement."));
  }, [warehouseId]);

  async function handleSubmit(values: Record<string, unknown>) {
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch(`/admin/warehouses/${warehouseId}`, { method: "PUT", body: JSON.stringify(values) });
      router.push("/dashboard/entrepots");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/entrepots" className="hover:text-white/70">
          Emplacements
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Modifier</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Modifier l&apos;emplacement</h1>

      {error && !warehouse && <p className="text-sm text-red-400">{error}</p>}

      {warehouse && (
        <WarehouseForm
          initial={{
            name: warehouse.name,
            type: warehouse.type,
            code: warehouse.code ?? "",
            region: warehouse.region,
            pays: warehouse.pays,
            ville: warehouse.ville,
            quartier: warehouse.quartier ?? "",
            latitude: String(warehouse.latitude),
            longitude: String(warehouse.longitude),
            phone: warehouse.phone ?? "",
            responsible_name: warehouse.responsible_name ?? "",
            is_active: warehouse.is_active,
          }}
          submitting={submitting}
          error={error}
          submitLabel="Enregistrer"
          onCancel={() => router.push("/dashboard/entrepots")}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
