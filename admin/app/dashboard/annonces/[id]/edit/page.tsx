"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { AnnouncementForm, AnnouncementFormValues } from "@/components/announcement-form";

type AnnouncementDetail = {
  id: number;
  text: string;
  icon: string | null;
  link_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};

export default function EditAnnouncementPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const announcementId = Number(params.id);

  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: AnnouncementDetail }>(`/admin/announcements/${announcementId}`)
      .then((res) => setAnnouncement(res.data))
      .catch(() => setError("Impossible de charger cette annonce."));
  }, [announcementId]);

  async function handleSubmit(payload: Record<string, unknown>) {
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch(`/admin/announcements/${announcementId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      router.push("/dashboard/annonces");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  }

  const initial: Partial<AnnouncementFormValues> | undefined = announcement
    ? {
        text: announcement.text,
        icon: announcement.icon ?? "",
        link_url: announcement.link_url ?? "",
        starts_at: announcement.starts_at ?? "",
        ends_at: announcement.ends_at ?? "",
        is_active: announcement.is_active,
      }
    : undefined;

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/annonces" className="hover:text-white/70">
          Annonces
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Modifier</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Modifier l&apos;annonce</h1>

      {error && !announcement && <p className="text-sm text-red-400">{error}</p>}

      {announcement && initial && (
        <AnnouncementForm
          initial={initial}
          submitting={submitting}
          error={error}
          submitLabel="Enregistrer"
          onCancel={() => router.push("/dashboard/annonces")}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
