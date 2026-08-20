"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export type UserOption = { id: number; name: string; phone: string | null };

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-orange/60";

export function NotificationForm({
  submitting,
  error,
  onCancel,
  onSubmit,
}: {
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (payload: {
    title: string;
    body: string | null;
    type: string | null;
    user_id: number | null;
    send_to_all: boolean;
    send_push: boolean;
  }) => void;
}) {
  const [target, setTarget] = useState<"one" | "all">("one");
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<UserOption[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("");
  const [sendPush, setSendPush] = useState(false);

  useEffect(() => {
    if (!userSearch) return;
    const timeout = setTimeout(() => {
      apiFetch<{ data: UserOption[] }>(`/admin/users?q=${encodeURIComponent(userSearch)}&role=customer`)
        .then((res) => setUserResults(res.data))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timeout);
  }, [userSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      title,
      body: body || null,
      type: type || null,
      user_id: target === "one" ? userId : null,
      send_to_all: target === "all",
      send_push: sendPush,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-5 text-sm font-semibold text-white/70">Destinataire</h2>

        <div className="mb-5 flex gap-3">
          <button
            type="button"
            onClick={() => setTarget("one")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              target === "one" ? "bg-brand-orange text-white" : "border border-white/10 text-white/60 hover:bg-white/5"
            }`}
          >
            Un client
          </button>
          <button
            type="button"
            onClick={() => setTarget("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              target === "all" ? "bg-brand-orange text-white" : "border border-white/10 text-white/60 hover:bg-white/5"
            }`}
          >
            Tous les clients
          </button>
        </div>

        {target === "one" && (
          <div className="relative">
            <label className="mb-1.5 block text-sm text-white/70">
              Client<span className="text-red-400">*</span>
            </label>
            <input
              required={!userId}
              value={userId ? userName : userSearch}
              onChange={(e) => {
                setUserId(null);
                setUserSearch(e.target.value);
              }}
              placeholder="Rechercher un client par nom ou téléphone..."
              className={inputClass}
            />
            {!userId && userSearch && userResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/10 bg-[#12141c] p-1.5 shadow-2xl">
                {userResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setUserId(u.id);
                      setUserName(u.name);
                      setUserSearch("");
                      setUserResults([]);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <span>{u.name}</span>
                    <span className="text-white/30">{u.phone}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {target === "all" && (
          <p className="text-sm text-white/40">
            Cette notification sera envoyée à tous les clients actifs. Cette action est irréversible.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-5 text-sm font-semibold text-white/70">Contenu</h2>

        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Titre<span className="text-red-400">*</span>
            </label>
            <input
              required
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Promotion !!!!"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Message</label>
            <textarea
              maxLength={2000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Message affiché dans la notification"
              className={inputClass}
            />
          </div>

          <div className="sm:max-w-xs">
            <label className="mb-1.5 block text-sm text-white/70">Type (optionnel)</label>
            <input
              maxLength={50}
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Ex : promo, commande, compte..."
              className={inputClass}
            />
            <p className="mt-1 text-xs text-white/30">Libre — sert uniquement à catégoriser côté client plus tard.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSendPush((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                sendPush ? "bg-brand-orange" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  sendPush ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <div>
              <p className="text-sm text-white/70">Envoyer aussi une notification push</p>
              <p className="text-xs text-white/30">
                En plus de l&apos;inbox in-app, envoie une alerte push aux appareils enregistrés du/des destinataire(s).
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 disabled:opacity-50"
        >
          {submitting ? "Envoi..." : "Envoyer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
