"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { CouponForm } from "@/components/coupon-form";

type Coupon = {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
};

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const couponId = Number(params.id);

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Coupon }>(`/admin/coupons/${couponId}`)
      .then((res) => setCoupon(res.data))
      .catch(() => setError("Impossible de charger ce coupon."));
  }, [couponId]);

  async function handleSubmit(values: Record<string, unknown>) {
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch(`/admin/coupons/${couponId}`, { method: "PUT", body: JSON.stringify(values) });
      router.push("/dashboard/coupons");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/coupons" className="hover:text-white/70">
          Coupons
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Modifier</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Modifier le coupon</h1>

      {error && !coupon && <p className="text-sm text-red-400">{error}</p>}

      {coupon && (
        <CouponForm
          initial={{
            code: coupon.code,
            type: coupon.type,
            value: String(coupon.value),
            min_order_amount: coupon.min_order_amount ? String(coupon.min_order_amount) : "",
            max_uses: coupon.max_uses ? String(coupon.max_uses) : "",
            expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : "",
            is_active: coupon.is_active,
          }}
          usedCount={coupon.used_count}
          submitting={submitting}
          error={error}
          submitLabel="Enregistrer"
          onCancel={() => router.push("/dashboard/coupons")}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
