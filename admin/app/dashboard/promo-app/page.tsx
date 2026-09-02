"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Trash2, UploadCloud } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type AppPromoSetting = {
  is_active: boolean;
  updated_at: string;
};

type AppPromoImage = {
  id: number;
  image: string;
  is_active: boolean;
  position: number;
};

export default function PromoAppPage() {
  const [loaded, setLoaded] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [images, setImages] = useState<AppPromoImage[]>([]);

  const [savingSwitch, setSavingSwitch] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<{ data: AppPromoSetting }>("/admin/app-promo"),
      apiFetch<{ data: AppPromoImage[] }>("/admin/app-promo/images"),
    ])
      .then(([setting, list]) => {
        setIsActive(setting.data.is_active);
        setUpdatedAt(setting.data.updated_at);
        setImages(list.data);
        setLoaded(true);
      })
      .catch(() => setError("Impossible de charger le widget."));
  }, []);

  async function toggleWidget() {
    const next = !isActive;
    setIsActive(next);
    setSavingSwitch(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: AppPromoSetting }>("/admin/app-promo", {
        method: "PUT",
        body: JSON.stringify({ is_active: next }),
      });
      setUpdatedAt(res.data.updated_at);
    } catch (err) {
      setIsActive(!next);
      setError(err instanceof ApiError ? err.message : "Échec de l'enregistrement.");
    } finally {
      setSavingSwitch(false);
    }
  }

  async function uploadImage(file: File | undefined | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("image", file);
      const res = await apiFetch<{ data: AppPromoImage }>("/admin/app-promo/images", {
        method: "POST",
        body: formData,
      });
      setImages((prev) => [...prev, res.data]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'envoi de l'image.");
    } finally {
      setUploading(false);
    }
  }

  async function toggleImage(image: AppPromoImage) {
    const next = !image.is_active;
    setImages((prev) => prev.map((i) => (i.id === image.id ? { ...i, is_active: next } : i)));
    try {
      await apiFetch(`/admin/app-promo/images/${image.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: next }),
      });
    } catch (err) {
      setImages((prev) => prev.map((i) => (i.id === image.id ? { ...i, is_active: !next } : i)));
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour.");
    }
  }

  async function deleteImage(image: AppPromoImage) {
    const previous = images;
    setImages((prev) => prev.filter((i) => i.id !== image.id));
    try {
      await apiFetch(`/admin/app-promo/images/${image.id}`, { method: "DELETE" });
    } catch (err) {
      setImages(previous);
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  return (
    <div className="-m-8 min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>Paramètres</span>
        <ChevronRight className="h-3 w-3" />
        <span>Widget Pop Up</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Widget Pop Up</h1>
        <p className="mt-1 text-sm text-white/40">
          Petite carte animée affichée en bas à gauche du site (desktop uniquement), qui invite les visiteurs à
          installer l&apos;application et met en avant la livraison gratuite sur leur première commande. Le texte
          est fixe ; ajoute autant d&apos;images que tu veux ci-dessous — elles défilent dans le widget, et tu
          peux activer/désactiver chacune indépendamment.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {!loaded ? (
        <p className="text-white/40">Chargement...</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
            <label className="mb-1.5 block text-sm text-white/70">Afficher le widget</label>
            <button
              type="button"
              disabled={savingSwitch}
              onClick={toggleWidget}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                isActive ? "bg-brand-orange" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <p className="mt-1 text-xs text-white/30">
              Interrupteur général — désactive-le pour retirer tout le widget du site sans perdre tes images.
            </p>
            {updatedAt && (
              <p className="mt-3 text-xs text-white/30">
                Dernière modification : {new Date(updatedAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
            <h2 className="mb-4 text-sm font-semibold text-white/70">Images du widget</h2>

            {images.length > 0 && (
              <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image) => (
                  <div key={image.id} className="group relative overflow-hidden rounded-xl ring-1 ring-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.image}
                      alt=""
                      className={`h-28 w-full object-cover transition-opacity ${image.is_active ? "" : "opacity-30"}`}
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/70 px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => toggleImage(image)}
                        className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                          image.is_active ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/50"
                        }`}
                      >
                        {image.is_active ? "Active" : "Inactive"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteImage(image)}
                        className="rounded-md p-1 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                uploadImage(e.dataTransfer.files?.[0]);
              }}
              className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-6 text-center transition-colors ${
                dragOver ? "border-brand-orange bg-brand-orange/5" : "border-white/10 hover:border-white/20"
              } ${uploading ? "pointer-events-none opacity-50" : ""}`}
            >
              <UploadCloud className="h-6 w-6 text-white/30" />
              <p className="text-sm text-white/40">
                {uploading ? "Envoi en cours..." : (
                  <>Faites glisser une image ou <span className="font-medium text-brand-blue">Parcourir</span></>
                )}
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => uploadImage(e.target.files?.[0])}
              />
            </label>
            <p className="mt-1 text-xs text-white/30">
              Sans image active, le widget affiche une illustration par défaut. 4 Mo maximum par image.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
