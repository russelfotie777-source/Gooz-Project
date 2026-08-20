"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiValidationError,
  type AddressPayload,
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { showToast } from "@/lib/toast";
import type { Address } from "@/lib/types";

// Shared by AddressesPage (mobile) and AddressesDesktop: the customer's
// address book, backed by the real /addresses endpoints (API §: addresses
// require auth, same session token pattern as the cart).
export function useAddresses() {
  const dict = useDictionary();
  const [status, setStatus] = useState<"loading" | "loggedOut" | "ready">("loading");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const refresh = useCallback((tok: string) => getAddresses(tok).then(setAddresses), []);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      setStatus("loggedOut");
      return;
    }

    setToken(session.token);
    refresh(session.token)
      .then(() => setStatus("ready"))
      .catch(() => setStatus("loggedOut"));
  }, [refresh]);

  function messageFor(err: unknown): string {
    return err instanceof ApiValidationError
      ? (Object.values(err.errors)[0]?.[0] ?? err.message)
      : dict.addresses.genericError;
  }

  // Every mutation below is entoured d'un try/catch local: on failure the UI
  // is put back in a stable state (pending cleared) instead of letting the
  // rejection propagate and leave buttons stuck. Feedback goes through the
  // shared toast channel rather than a view-local banner — the previous
  // local banner only rendered in the list view, so a failure/success
  // during create or update (which happens in the form view) was silently
  // invisible until a stale message resurfaced later.
  async function create(payload: AddressPayload) {
    if (!token) return;
    setPending(true);
    try {
      await createAddress(token, payload);
      await refresh(token);
      showToast(dict.addresses.createdSuccess, "success");
    } catch (err) {
      showToast(messageFor(err), "error");
      throw err;
    } finally {
      setPending(false);
    }
  }

  async function update(id: number, payload: Partial<AddressPayload>) {
    if (!token) return;
    setPending(true);
    try {
      await updateAddress(token, id, payload);
      await refresh(token);
      showToast(payload.is_default ? dict.addresses.defaultSuccess : dict.addresses.updatedSuccess, "success");
    } catch (err) {
      showToast(messageFor(err), "error");
      throw err;
    } finally {
      setPending(false);
    }
  }

  async function remove(id: number) {
    if (!token) return;
    setPending(true);
    try {
      await deleteAddress(token, id);
      await refresh(token);
      showToast(dict.addresses.deletedSuccess, "success");
    } catch (err) {
      showToast(messageFor(err), "error");
      throw err;
    } finally {
      setPending(false);
    }
  }

  function setDefault(id: number) {
    return update(id, { is_default: true });
  }

  return { status, addresses, pending, create, update, remove, setDefault };
}
