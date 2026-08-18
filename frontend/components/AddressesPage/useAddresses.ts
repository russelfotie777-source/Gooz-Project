"use client";

import { useCallback, useEffect, useState } from "react";
import { type AddressPayload, createAddress, deleteAddress, getAddresses, updateAddress } from "@/lib/api";
import { getSession } from "@/lib/auth";
import type { Address } from "@/lib/types";

// Shared by AddressesPage (mobile) and AddressesDesktop: the customer's
// address book, backed by the real /addresses endpoints (API §: addresses
// require auth, same session token pattern as the cart).
export function useAddresses() {
  const [status, setStatus] = useState<"loading" | "loggedOut" | "ready">("loading");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [token, setToken] = useState<string | null>(null);

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

  async function create(payload: AddressPayload) {
    if (!token) return;
    await createAddress(token, payload);
    await refresh(token);
  }

  async function update(id: number, payload: Partial<AddressPayload>) {
    if (!token) return;
    await updateAddress(token, id, payload);
    await refresh(token);
  }

  async function remove(id: number) {
    if (!token) return;
    await deleteAddress(token, id);
    await refresh(token);
  }

  function setDefault(id: number) {
    return update(id, { is_default: true });
  }

  return { status, addresses, create, update, remove, setDefault };
}
