"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { SupplierForm } from "@/components/supplier-form";

export default function CreateSupplierPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(values: Record<string, unknown>, addAnother: boolean) {
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/admin/suppliers", { method: "POST", body: JSON.stringify(values) });
      if (addAnother) {
        setFormKey((k) => k + 1);
      } else {
        router.push("/dashboard/fournisseurs");
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
        <Link href="/dashboard/fournisseurs" className="hover:text-white/70">
          Fournisseurs
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Créer</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Créer Fournisseur</h1>

      <SupplierForm
        key={formKey}
        submitting={submitting}
        error={error}
        showAddAnother
        submitLabel="Créer"
        onCancel={() => router.push("/dashboard/fournisseurs")}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
