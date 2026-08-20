"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import { apiFetch, type Paginated } from "@/lib/api";

type AdminNotification = {
  id: number;
  user_id: number;
  user_name: string | null;
  user_phone: string | null;
  title: string;
  body: string | null;
  type: string | null;
  is_read: boolean;
  created_at: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export default function NotificationsPushPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AdminNotification[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Paginated<AdminNotification>>("/admin/notifications")
      .then((res) => setNotifications(res.data))
      .catch(() => setError("Impossible de charger les notifications."));
  }, []);

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Notifications</span>
        <ChevronRight className="h-3 w-3" />
        <span>Liste</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="mt-1 text-sm text-white/40">
            Notifications envoyées aux clients (inbox in-app, avec push optionnel).
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/notifications-push/create")}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Envoyer une notification
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
              <th className="px-5 py-3 font-medium">Destinataire</th>
              <th className="px-5 py-3 font-medium">Titre</th>
              <th className="px-5 py-3 font-medium">Message</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium">Envoyé le</th>
            </tr>
          </thead>
          <tbody>
            {notifications?.map((notification) => (
              <tr key={notification.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <p className="font-medium text-white">{notification.user_name ?? `#${notification.user_id}`}</p>
                  {notification.user_phone && <p className="text-xs text-white/30">{notification.user_phone}</p>}
                </td>
                <td className="px-5 py-3 font-medium text-white">{notification.title}</td>
                <td className="max-w-xs truncate px-5 py-3 text-white/50">{notification.body ?? "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      notification.is_read
                        ? "bg-white/5 text-white/40"
                        : "bg-brand-orange/10 text-brand-orange"
                    }`}
                  >
                    {notification.is_read ? "Lu" : "Non lu"}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/50">{formatDate(notification.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {notifications?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucune notification pour le moment.</p>
        )}
      </div>
    </div>
  );
}
