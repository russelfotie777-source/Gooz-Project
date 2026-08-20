"use client";

import { useEffect, useRef } from "react";

// Shared by every form that shows a server-side error via role="alert"
// (Auth, AddressForm, DeleteAccountModal, EditProfileModal, TicketModal,
// CompletePhoneModal): role="alert" announces the message to a screen
// reader on its own, but keyboard focus itself was never moved there — a
// sighted keyboard user just had the message appear somewhere on the page
// with no indication of where. Attach the returned ref to the error
// element itself (with tabIndex={-1}, since a <p> isn't focusable by
// default) and it grabs focus whenever the message appears.
export function useFocusOnError<T extends HTMLElement>(error: string | null): React.RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (error) ref.current?.focus();
  }, [error]);

  return ref;
}
