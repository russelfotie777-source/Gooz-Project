import { Construction } from "lucide-react";
import { findNavItem } from "@/lib/nav";

export default async function ComingSoonPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const pathname = `/dashboard/${slug.join("/")}`;
  const navItem = findNavItem(pathname);
  const Icon = navItem?.icon ?? Construction;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-in-up">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-orange/15 to-brand-violet/10 text-brand-orange">
        <Icon className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-semibold text-zinc-900">
        {navItem?.label ?? "Module"}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        Cette fonctionnalité est prévue dans la feuille de route de Shopitech mais n&apos;est pas
        encore connectée au backend. Elle apparaîtra ici dès que l&apos;API correspondante sera
        disponible.
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
        <Construction className="h-3.5 w-3.5" />
        En préparation
      </span>
    </div>
  );
}
