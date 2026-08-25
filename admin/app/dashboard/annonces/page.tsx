"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type Announcement = {
  id: number;
  text: string;
  icon: string | null;
  link_url: string | null;
  position: number;
  is_active: boolean;
};

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  function load() {
    apiFetch<{ data: Announcement[] }>("/admin/announcements")
      .then((res) => setAnnouncements(res.data))
      .catch(() => setError("Impossible de charger les annonces."));
  }

  useEffect(load, []);

  async function toggleActive(announcement: Announcement) {
    try {
      await apiFetch(`/admin/announcements/${announcement.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !announcement.is_active }),
      });
      setAnnouncements(
        (prev) =>
          prev?.map((a) => (a.id === announcement.id ? { ...a, is_active: !a.is_active } : a)) ?? null
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    }
  }

  async function deleteAnnouncement(id: number) {
    if (!confirm("Supprimer cette annonce ?")) return;
    try {
      await apiFetch(`/admin/announcements/${id}`, { method: "DELETE" });
      setAnnouncements((prev) => prev?.filter((a) => a.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Annonces</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Annonces</h1>
          <p className="mt-1 text-sm text-white/40">
            Messages affichés dans la barre d&apos;annonce en haut de la boutique.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/annonces/create")}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Ajouter une annonce
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">Message</th>
              <th className="px-5 py-3 font-medium">Lien</th>
              <th className="px-5 py-3 font-medium">Actif</th>
              <th className="px-5 py-3 font-medium">Ordre</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements?.map((announcement) => (
              <tr key={announcement.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 font-medium text-white">
                  {announcement.icon ? `${announcement.icon} ` : ""}
                  {announcement.text}
                </td>
                <td className="px-5 py-3 text-white/50">{announcement.link_url ?? "—"}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleActive(announcement)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      announcement.is_active ? "bg-brand-orange" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        announcement.is_active ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-5 py-3 text-white/50">{announcement.position}</td>
                <td className="relative px-5 py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === announcement.id ? null : announcement.id)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === announcement.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-5 top-11 z-20 w-44 rounded-xl border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                        <Link
                          href={`/dashboard/annonces/${announcement.id}/edit`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-amber-400 hover:bg-white/5"
                        >
                          <Pencil className="h-4 w-4" />
                          Modifier
                        </Link>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            deleteAnnouncement(announcement.id);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {announcements?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucune annonce pour le moment.</p>
        )}
      </div>
    </div>
  );
}
