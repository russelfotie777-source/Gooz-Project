"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Phone, ShieldAlert } from "lucide-react";
import { ApiError, apiFetch, setToken } from "@/lib/api";
import { LogoWordmark } from "@/components/logo";
import { canAccessAdminPanel } from "@/lib/roles";

type LoginResponse = {
  user: { id: number; name: string; phone: string; role: string; is_active: boolean };
  token: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const data = await apiFetch<LoginResponse>("/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ phone, password, device_name: "admin-web" }),
      });

      if (!canAccessAdminPanel(data.user.role)) {
        setError("Ce compte n'a pas les droits administrateur.");
        return;
      }

      setToken(data.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de contacter le serveur.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-[#0b0d12] px-4">
      {/* Ambient brand glow */}
      <div className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-brand-orange/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-brand-blue/20 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-brand-violet/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="mb-8 flex justify-center">
          <LogoWordmark className="text-white" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <h1 className="text-lg font-semibold text-white">Connexion administrateur</h1>
          <p className="mt-1 text-sm text-white/50">
            Accédez au panel de gestion de la boutique.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="phone"
                  type="tel"
                  required
                  autoFocus
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-brand-orange/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-brand-orange/20"
                  placeholder="699000001"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/40">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-brand-orange/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-brand-orange/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-dark px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 transition-all hover:shadow-brand-orange/30 hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/25">
          Accès réservé aux administrateurs Shopitech.
        </p>
      </div>
    </div>
  );
}
