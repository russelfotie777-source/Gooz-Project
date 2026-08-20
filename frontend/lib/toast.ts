// Shared feedback channel any client component can fire into without
// threading a toast store through the tree — same pub/sub shape as
// cartEvents.ts. Exists because feedback was previously ad hoc per
// component (a confirmation after creating a ticket, but nothing after
// deleting an address or logging out) — one channel, one visual language.
export type ToastVariant = "success" | "error" | "info";

export interface ToastPayload {
  message: string;
  variant: ToastVariant;
}

const TOAST_EVENT = "shopitech:toast";

export function showToast(message: string, variant: ToastVariant = "info"): void {
  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: { message, variant } }));
}

export function onToast(handler: (payload: ToastPayload) => void): () => void {
  function listener(e: Event) {
    handler((e as CustomEvent<ToastPayload>).detail);
  }
  window.addEventListener(TOAST_EVENT, listener);
  return () => window.removeEventListener(TOAST_EVENT, listener);
}
