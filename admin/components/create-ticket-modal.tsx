"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

const CATEGORIES = ["Livraison", "Paiement", "Produit", "Compte", "Retour / Remboursement", "Autre"];
const PRIORITIES: { value: string; label: string }[] = [
  { value: "basse", label: "Basse" },
  { value: "moyenne", label: "Moyenne" },
  { value: "haute", label: "Haute" },
  { value: "urgente", label: "Urgente" },
];

type Agent = { id: number; name: string };

export function CreateTicketModal({
  userId,
  userName,
  onClose,
  onCreated,
}: {
  userId: number;
  userName: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("moyenne");
  const [message, setMessage] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<{ data: Agent[] }>("/admin/users?role=admin")
      .then((res) => setAgents(res.data))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!category) {
      setError("Sélectionne une catégorie.");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch(`/admin/users/${userId}/tickets`, {
        method: "POST",
        body: JSON.stringify({
          subject,
          category,
          priority,
          message: message || null,
          assigned_to: assignedTo ? Number(assignedTo) : null,
        }),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la création du ticket.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12141c] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Créer un ticket</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-xs text-white/40">Client : {userName}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">
              Sujet<span className="text-red-400">*</span>
            </label>
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">
              Catégorie<span className="text-red-400">*</span>
            </label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
            >
              <option value="" className="bg-[#12141c]">
                Sélectionnez une option
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#12141c]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">
              Priorité<span className="text-red-400">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value} className="bg-[#12141c]">
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">Message initial</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">Assigner à un agent</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
            >
              <option value="" className="bg-[#12141c]">
                Non assigné
              </option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id} className="bg-[#12141c]">
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
            >
              {submitting ? "Envoi..." : "Soumettre"}
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
