"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { NotificationForm } from "@/components/notification-form";

export default function CreateNotificationPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(payload: {
    title: string;
    body: string | null;
    type: string | null;
    user_id: number | null;
    send_to_all: boolean;
    send_push: boolean;
  }) {
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/admin/notifications", { method: "POST", body: JSON.stringify(payload) });
      router.push("/dashboard/notifications-push");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'envoi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/notifications-push" className="hover:text-white/70">
          Notifications
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Envoyer</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Envoyer une notification</h1>

      <NotificationForm
        submitting={submitting}
        error={error}
        onCancel={() => router.push("/dashboard/notifications-push")}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
