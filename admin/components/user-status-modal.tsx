"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

const STATUS_META: Record<string, { title: string; confirmLabel: string; accent: string }> = {
  restricted: {
    title: "Restreindre ce client",
    confirmLabel: "Restreindre",
    accent: "bg-amber-500 hover:brightness-105",
  },
  blocked: {
    title: "Bloquer ce client",
    confirmLabel: "Bloquer",
    accent: "bg-red-600 hover:brightness-105",
  },
  silently_blocked: {
    title: "Blocage silencieux",
    confirmLabel: "Activer le blocage silencieux",
    accent: "bg-violet-600 hover:brightness-105",
  },
};

export function UserStatusModal({
  userId,
  userName,
  status,
  onClose,
  onUpdated,
}: {
  userId: number;
  userName: string;
  status: "restricted" | "blocked" | "silently_blocked";
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const meta = STATUS_META[status];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch(`/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, reason: reason || null }),
      });
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#12141c] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{meta.title}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-xs text-white/40">Client : {userName}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">Raison (optionnel)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all disabled:opacity-50 ${meta.accent}`}
            >
              {submitting ? "..." : meta.confirmLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/5"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
