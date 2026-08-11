"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

export function Toast({
  title,
  message,
  onClose,
}: {
  title: string;
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timeout = setTimeout(onClose, 4000);
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className="fixed right-6 top-6 z-50 flex w-80 items-start gap-3 rounded-xl border border-white/10 bg-[#12141c] p-4 shadow-2xl animate-fade-in-up">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs text-white/50">{message}</p>
      </div>
      <button onClick={onClose} className="text-white/30 hover:text-white/60">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
