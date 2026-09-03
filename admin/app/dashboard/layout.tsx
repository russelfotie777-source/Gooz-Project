"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { apiFetch, clearToken } from "@/lib/api";
import { LogoWordmark } from "@/components/logo";
import { NAV_SECTIONS } from "@/lib/nav";
import { canAccessAdminPanel } from "@/lib/roles";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV_SECTIONS.map((s) => [s.title, true]))
  );

  useEffect(() => {
    let cancelled = false;

    function checkMe() {
      apiFetch<{ data: { id: number; role: string } }>("/me")
        .then(({ data: user }) => {
          if (cancelled) return;
          if (!canAccessAdminPanel(user.role)) {
            clearToken();
            router.replace("/login");
            return;
          }
          setChecking(false);
        })
        .catch(() => {
          if (cancelled) return;
          clearToken();
          router.replace("/login");
        });
    }

    checkMe();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    try {
      await apiFetch("/logout", { method: "POST" });
    } finally {
      clearToken();
      router.replace("/login");
    }
  }

  const visibleSections = useMemo(() => NAV_SECTIONS, []);

  if (checking) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-[#0b0d12]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-brand-orange" />
          <p className="text-sm text-white/40">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 bg-[#f6f7f9]">
      <aside className="flex h-screen w-64 flex-col bg-[#0b0d12]">
        <div className="shrink-0 border-b border-white/5 px-5 py-5">
          <LogoWordmark className="text-white" />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {visibleSections.map((section) => {
            const isOpen = openSections[section.title];
            return (
              <div key={section.title} className="mb-6 last:mb-0">
                {section.title !== "Tableau de bord" && (
                  <button
                    onClick={() =>
                      setOpenSections((prev) => ({ ...prev, [section.title]: !prev[section.title] }))
                    }
                    className="mb-1 flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/30 transition-colors hover:text-white/50"
                  >
                    {section.title}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                    />
                  </button>
                )}

                {isOpen && (
                  <ul className="flex flex-col gap-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
                                : "text-white/50 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <Icon
                              className={`h-4 w-4 shrink-0 ${
                                isActive ? "text-white" : "text-white/40 group-hover:text-white/80"
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/5 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/50 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="h-screen flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
