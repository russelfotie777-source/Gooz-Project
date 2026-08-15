"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { SupplierForm } from "@/components/supplier-form";

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
};

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const supplierId = Number(params.id);

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Supplier }>(`/admin/suppliers/${supplierId}`)
      .then((res) => setSupplier(res.data))
      .catch(() => setError("Impossible de charger ce fournisseur."));
  }, [supplierId]);

  async function handleSubmit(values: Record<string, unknown>) {
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch(`/admin/suppliers/${supplierId}`, { method: "PUT", body: JSON.stringify(values) });
      router.push("/dashboard/fournisseurs");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/fournisseurs" className="hover:text-white/70">
          Fournisseurs
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Modifier</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Modifier le fournisseur</h1>

      {error && !supplier && <p className="text-sm text-red-400">{error}</p>}

      {supplier && (
        <SupplierForm
          initial={{
            company_name: supplier.company_name,
            contact_name: supplier.contact_name,
            email: supplier.email ?? "",
            phone: supplier.phone,
            pays: supplier.pays,
            numero_fiscal: supplier.numero_fiscal ?? "",
            adresse: supplier.adresse,
            notes: supplier.notes ?? "",
            type: supplier.type,
            is_active: supplier.is_active,
          }}
          submitting={submitting}
          error={error}
          submitLabel="Enregistrer"
          onCancel={() => router.push("/dashboard/fournisseurs")}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
