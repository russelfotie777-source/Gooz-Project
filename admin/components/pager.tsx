import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pager({
  page,
  lastPage,
  total,
  onChange,
}: {
  page: number;
  lastPage: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-zinc-100 px-1 pt-4">
      <p className="text-xs text-zinc-400">{total} résultat{total > 1 ? "s" : ""}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium text-zinc-600">
          {page} / {lastPage}
        </span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= lastPage}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
