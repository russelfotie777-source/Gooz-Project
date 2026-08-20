"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type Ticket = {
  id: number;
  user_id: number;
  customer_name: string | null;
  customer_phone: string | null;
  subject: string;
  category: string;
  priority: "basse" | "moyenne" | "haute" | "urgente";
  status: "ouvert" | "en_cours" | "résolu" | "fermé";
  message: string | null;
  assigned_to_id: number | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type Agent = { id: number; name: string };

const PRIORITY_LABELS: Record<Ticket["priority"], string> = {
  basse: "Basse",
  moyenne: "Moyenne",
  haute: "Haute",
  urgente: "Urgente",
};

const PRIORITY_STYLES: Record<Ticket["priority"], string> = {
  basse: "bg-white/10 text-white/60",
  moyenne: "bg-sky-500/10 text-sky-400",
  haute: "bg-amber-500/10 text-amber-400",
  urgente: "bg-red-500/10 text-red-400",
};

const STATUS_LABELS: Record<Ticket["status"], string> = {
  ouvert: "Ouvert",
  en_cours: "En cours",
  résolu: "Résolu",
  fermé: "Fermé",
};

const STATUS_STYLES: Record<Ticket["status"], string> = {
  ouvert: "bg-red-500/10 text-red-400",
  en_cours: "bg-amber-500/10 text-amber-400",
  résolu: "bg-emerald-500/10 text-emerald-400",
  fermé: "bg-white/10 text-white/50",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <h2 className="mb-5 text-sm font-semibold text-white/70">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <div className="mt-1 text-sm text-white">{children}</div>
    </div>
  );
}

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const ticketId = Number(params.id);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [statusValue, setStatusValue] = useState<Ticket["status"] | "">("");
  const [assignValue, setAssignValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    apiFetch<{ data: Ticket }>(`/admin/tickets/${ticketId}`)
      .then((res) => {
        setTicket(res.data);
        setStatusValue(res.data.status);
        setAssignValue(res.data.assigned_to_id ? String(res.data.assigned_to_id) : "");
      })
      .catch(() => setError("Impossible de charger ce ticket."));
  }

  useEffect(load, [ticketId]);

  useEffect(() => {
    apiFetch<{ data: Agent[] }>("/admin/users?role=admin")
      .then((res) => setAgents(res.data))
      .catch(() => {});
  }, []);

  async function updateStatus() {
    if (!ticket || !statusValue) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/admin/tickets/${ticket.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: statusValue }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour du statut.");
    } finally {
      setBusy(false);
    }
  }

  async function updateAssignee() {
    if (!ticket) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/admin/tickets/${ticket.id}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ assigned_to: assignValue ? Number(assignValue) : null }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'assignation.");
    } finally {
      setBusy(false);
    }
  }

  if (!ticket) {
    return (
      <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
        {error ? <p className="text-sm text-red-400">{error}</p> : <p className="text-sm text-white/40">Chargement…</p>}
      </div>
    );
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/dashboard/tickets" className="hover:text-white/70">
          Tickets
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>#{ticket.id}</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{ticket.subject}</h1>
        <div className="flex items-center gap-2">
          <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[ticket.priority]}`}>
            {PRIORITY_LABELS[ticket.priority] ?? ticket.priority}
          </span>
          <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[ticket.status]}`}>
            {STATUS_LABELS[ticket.status] ?? ticket.status}
          </span>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
      )}

      <Section title="Aperçu">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Client">
            <Link href={`/dashboard/clients/${ticket.user_id}`} className="hover:text-brand-orange">
              {ticket.customer_name ?? "—"}
            </Link>
          </Field>
          <Field label="Téléphone">{ticket.customer_phone ?? "—"}</Field>
          <Field label="Catégorie">{ticket.category}</Field>
          <Field label="Créé par">{ticket.created_by ?? "—"}</Field>
          <Field label="Créé le">{formatDate(ticket.created_at)}</Field>
          <Field label="Dernière mise à jour">{formatDate(ticket.updated_at)}</Field>
        </div>
      </Section>

      <Section title="Message">
        <p className="whitespace-pre-wrap text-sm text-white/80">{ticket.message || "Aucun message."}</p>
      </Section>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Section title="Changer le statut">
          <div className="flex items-center gap-3">
            <select
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value as Ticket["status"])}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value} className="bg-[#12141c]">{label}</option>
              ))}
            </select>
            <button
              onClick={updateStatus}
              disabled={busy || statusValue === ticket.status}
              className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
            >
              Mettre à jour
            </button>
          </div>
        </Section>

        <Section title="Assigner à un agent">
          <div className="flex items-center gap-3">
            <select
              value={assignValue}
              onChange={(e) => setAssignValue(e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
            >
              <option value="" className="bg-[#12141c]">Non assigné</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id} className="bg-[#12141c]">{agent.name}</option>
              ))}
            </select>
            <button
              onClick={updateAssignee}
              disabled={busy || assignValue === (ticket.assigned_to_id ? String(ticket.assigned_to_id) : "")}
              className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
            >
              Assigner
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
