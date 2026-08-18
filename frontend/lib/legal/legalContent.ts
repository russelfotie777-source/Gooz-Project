// Shared shape for long-form bilingual legal pages (Privacy Policy, Terms of
// Use). Kept out of dictionaries/{fr,en}.ts on purpose: that file holds short
// UI strings, and each of these documents is ~3000 words per language —
// mixing the two would bloat every dictionary read for no benefit, since
// this content is only ever rendered by the LegalArticle component.
export interface LegalSubsection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  subsections?: LegalSubsection[];
}

export interface LegalDocument {
  title: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  intro: string[];
  tocLabel: string;
  sections: LegalSection[];
}

// Registry of cross-document mentions that LegalArticle can turn into a real
// link. Each target lists both the French and English exact phrase it
// matches, so a caller opts in per *document* (not per language) via
// LegalArticle's `internalLinks` prop. Kept as an explicit opt-in per page,
// rather than always-on: the Privacy Policy's own business-transactions
// clause mentions "a different Privacy Policy" belonging to a future
// acquirer, not ours, so auto-linking every occurrence everywhere would be
// wrong there — see PrivacyPolicyPage/Desktop, which never pass this prop.
export const LEGAL_LINK_TARGETS = {
  privacyPolicy: {
    phrases: ["Politique de Confidentialité", "Privacy Policy"],
    href: "/politique-confidentialite",
  },
  termsOfUse: {
    phrases: ["Conditions Générales d'Utilisation", "Terms of Use"],
    href: "/conditions-utilisation",
  },
  returnPolicy: {
    phrases: ["Politique de Retour", "Return Policy"],
    href: "/politique-retour",
  },
  deliveryFees: {
    phrases: ["Frais de Livraison", "Delivery Fees"],
    href: "/frais-livraison",
  },
  termsOfSale: {
    phrases: ["Conditions Générales d'Achat", "Terms of Sale"],
    href: "/conditions-achat",
  },
  allAboutDelivery: {
    phrases: ["Tout sur la Livraison", "All About Delivery"],
    href: "/tout-sur-la-livraison",
  },
} as const;

export type LegalLinkTarget = keyof typeof LEGAL_LINK_TARGETS;
