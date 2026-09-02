"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronRight as Crumb, Download, FileSpreadsheet } from "lucide-react";
import { apiFetch, Paginated } from "@/lib/api";
import { exportDailyReportToExcel, exportDailyReportToPdf, DailyReportRow } from "@/lib/reportExport";

type GroupBy = "day" | "week" | "month";

const GROUP_LABELS: Record<GroupBy, string> = {
  day: "Quotidien",
  week: "Hebdomadaire",
  month: "Mensuel",
};

function formatXAF(value: number): string {
  return `${Number(value).toLocaleString("fr-FR")} FCFA`;
}

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function RapportJournalierPage() {
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 29);

  const [from, setFrom] = useState(toDateInput(monthAgo));
  const [to, setTo] = useState(toDateInput(today));
  const [groupBy, setGroupBy] = useState<GroupBy>("day");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<DailyReportRow[] | null>(null);
  const [meta, setMeta] = useState<Paginated<DailyReportRow>["meta"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  function load() {
    const query = new URLSearchParams({
      from,
      to,
      group_by: groupBy,
      per_page: String(perPage),
      page: String(page),
    });

    apiFetch<Paginated<DailyReportRow>>(`/admin/reports/daily-summary?${query.toString()}`)
      .then((res) => {
        setRows(res.data);
        setMeta(res.meta);
        setError(null);
      })
      .catch(() => setError("Impossible de charger le rapport."));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage]);

  async function fetchAllRows(): Promise<DailyReportRow[]> {
    const query = new URLSearchParams({ from, to, group_by: groupBy, per_page: "1000", page: "1" });
    const res = await apiFetch<Paginated<DailyReportRow>>(`/admin/reports/daily-summary?${query.toString()}`);
    return res.data;
  }

  async function handleExportExcel() {
    setExporting(true);
    try {
      const all = await fetchAllRows();
      exportDailyReportToExcel(all, `rapport-journalier-${from}-${to}`);
    } catch {
      setError("Échec de l'export Excel.");
    } finally {
      setExporting(false);
    }
  }

  async function handleExportPdf() {
    setExporting(true);
    try {
      const all = await fetchAllRows();
      exportDailyReportToPdf(all, `rapport-journalier-${from}-${to}`, "Rapport journalier");
    } catch {
      setError("Échec de l'export PDF.");
    } finally {
      setExporting(false);
    }
  }

  const from1Based = meta ? (meta.current_page - 1) * meta.per_page + 1 : 0;
  const toIndex = meta ? Math.min(meta.current_page * meta.per_page, meta.total) : 0;

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Rapports</span>
        <Crumb className="h-3 w-3" />
        <span>Rapport journalier</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rapport journalier</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white hover:bg-brand-orange/90 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Exporter PDF
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white hover:bg-brand-orange/90 disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exporter Excel
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.03]">
        <div className="flex flex-wrap items-end gap-4 border-b border-white/5 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-white/40">
              Date de début
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-white/40">
              Date de fin
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-white/40">
              Grouper par
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-orange/60"
            >
              {(Object.keys(GROUP_LABELS) as GroupBy[]).map((g) => (
                <option key={g} value={g} className="bg-[#12141c]">
                  {GROUP_LABELS[g]}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setPage(1);
              load();
            }}
            className="rounded-lg bg-brand-orange px-5 py-2 text-sm font-medium text-white hover:bg-brand-orange/90"
          >
            Rechercher
          </button>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-white/30">
              <th className="px-5 py-3 font-medium">Période</th>
              <th className="px-5 py-3 font-medium">Commandes</th>
              <th className="px-5 py-3 font-medium">Ventes brutes</th>
              <th className="px-5 py-3 font-medium">Remises</th>
              <th className="px-5 py-3 font-medium">Ventes nettes</th>
            </tr>
          </thead>
          <tbody>
            {rows?.map((row) => (
              <tr key={row.period} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-white">{row.period}</td>
                <td className="px-5 py-3 text-white/60">{row.orders_count}</td>
                <td className="px-5 py-3 text-white/60">{formatXAF(row.gross_sales)}</td>
                <td className="px-5 py-3 text-white/60">{formatXAF(row.discounts)}</td>
                <td className="px-5 py-3 font-medium text-emerald-400">{formatXAF(row.net_sales)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-white/30">Aucune donnée pour cette période.</p>
        )}

        {meta && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-5 py-4">
            <p className="text-xs text-white/30">
              Affichage de {from1Based} à {toIndex} sur {meta.total} résultat{meta.total > 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30">par page</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPage(1);
                    setPerPage(Number(e.target.value));
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none"
                >
                  {[10, 25, 50].map((n) => (
                    <option key={n} value={n} className="bg-[#12141c]">
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              {meta.last_page > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-medium text-white/60">
                    {meta.current_page} / {meta.last_page}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= meta.last_page}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
