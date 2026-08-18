import type { Locale } from "../i18n/config";
import type { LegalDocument } from "./legalContent";

// Bilingual content for the /frais-livraison page — details how delivery
// zones, fees and timeframes work, complementing article 4 of our Terms of
// Use (lib/legal/termsOfUse.ts).
export const DELIVERY_FEES: Record<Locale, LegalDocument> = {
  fr: {
    title: "Frais de livraison",
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdated: "14 août 2026",
    tocLabel: "Sommaire",
    intro: [
      "Cette page explique comment fonctionnent les zones de livraison, le calcul des frais et les délais indicatifs sur Shopitech. Elle complète l'article 4 (Livraison) de nos Conditions Générales d'Utilisation.",
    ],
    sections: [
      {
        id: "zones-desservies",
        heading: "1. Zones desservies",
        paragraphs: [
          "Shopitech livre dans les villes et quartiers progressivement couverts par notre réseau de livraison. La disponibilité de la livraison pour une adresse donnée est vérifiée directement dans l'Application, au moment où vous sélectionnez ou ajoutez votre adresse de livraison : seuls les quartiers effectivement desservis sont proposés.",
          "Notre zone de couverture est amenée à évoluer et à s'étendre progressivement à de nouvelles villes. Si votre quartier n'apparaît pas encore dans la liste, cela signifie qu'il n'est pas encore desservi à ce jour.",
        ],
      },
      {
        id: "calcul-frais",
        heading: "2. Comment les frais de livraison sont calculés",
        paragraphs: [
          "Les frais de livraison sont calculés automatiquement en fonction, notamment, de la distance entre l'entrepôt le plus proche et votre adresse de livraison, ainsi que du nombre d'articles composant votre commande.",
          "Le montant exact de vos frais de livraison vous est systématiquement communiqué avant toute validation de commande, lors de l'étape de livraison du parcours d'achat, puis rappelé dans le récapitulatif de votre commande. Un montant plancher et un montant plafond s'appliquent, de sorte que les frais de livraison restent raisonnables quelle que soit la distance.",
          "Nous nous réservons le droit de faire évoluer nos tarifs de livraison à tout moment ; seul le montant affiché et confirmé au moment de la validation de votre commande vous est applicable.",
        ],
      },
      {
        id: "delais",
        heading: "3. Délais de livraison indicatifs",
        paragraphs: ["Les délais ci-dessous sont donnés à titre indicatif et peuvent varier selon la disponibilité du produit, la zone exacte de livraison et les conditions de circulation :"],
        bullets: [
          "Douala : entre 30 minutes et 48 heures ;",
          "Yaoundé : entre 24 et 72 heures ;",
          "Autres villes : la livraison n'est, à ce jour, pas encore disponible en dehors des zones mentionnées ci-dessus.",
        ],
      },
      {
        id: "suivi",
        heading: "4. Réception de votre commande",
        paragraphs: [
          "Conformément à nos Conditions Générales d'Utilisation, vous vous engagez à fournir une adresse de livraison exacte et à rester joignable au numéro de téléphone communiqué lors de votre commande : notre livreur partenaire pourra être amené à vous contacter directement pour organiser la remise de votre colis.",
          "En cas d'absence lors du passage du livreur, une nouvelle tentative de livraison ou des modalités de retrait vous seront proposées via la rubrique « Nous contacter » de l'Application.",
        ],
      },
      {
        id: "modifications",
        heading: "5. Modifications de cette page",
        paragraphs: [
          "Nous nous réservons le droit de modifier les informations de cette page à tout moment, notamment pour refléter l'évolution de nos zones de livraison ou de nos délais. Toute modification substantielle entre en vigueur à l'expiration d'un délai de quarante-huit (48) heures suivant sa publication sur cette page, laquelle publication est matérialisée par la mise à jour de la date de « Dernière mise à jour » figurant en tête des présentes.",
        ],
      },
      {
        id: "contact",
        heading: "6. Nous contacter",
        paragraphs: ["Pour toute question relative à la livraison de votre commande, vous pouvez nous contacter :"],
        bullets: [
          "Par e-mail : contact@shopitech.cm",
          "Par courrier : Shopitech (filiale de iTech Services SARL — itechservices.cm), quartier Akwa Douche, Douala, Cameroun",
          "Via l'assistance intégrée à l'application, en ouvrant un ticket depuis la rubrique « Nous contacter »",
          "Site web : shopitech.cm",
        ],
      },
    ],
  },
  en: {
    title: "Delivery Fees",
    lastUpdatedLabel: "Last updated",
    lastUpdated: "August 14, 2026",
    tocLabel: "Table of contents",
    intro: [
      "This page explains how delivery zones, fees and estimated timeframes work on Shopitech. It complements article 4 (Delivery) of our Terms of Use.",
    ],
    sections: [
      {
        id: "zones-desservies",
        heading: "1. Areas We Deliver To",
        paragraphs: [
          "Shopitech delivers to the cities and neighborhoods progressively covered by our delivery network. Delivery availability for a given address is checked directly within the Application, when you select or add your delivery address: only neighborhoods we actually serve are shown as options.",
          "Our coverage area is expected to evolve and expand progressively to new cities. If your neighborhood does not yet appear in the list, this means it is not yet served as of today.",
        ],
      },
      {
        id: "calcul-frais",
        heading: "2. How Delivery Fees Are Calculated",
        paragraphs: [
          "Delivery fees are calculated automatically based, in particular, on the distance between the nearest warehouse and your delivery address, as well as the number of items in your order.",
          "The exact amount of your delivery fee is always shown to you before you confirm your order, at the delivery step of the checkout flow, and is then restated in your order summary. A minimum and a maximum amount apply, so that delivery fees remain reasonable regardless of distance.",
          "We reserve the right to change our delivery pricing at any time; only the amount shown and confirmed at the time you place your order applies to you.",
        ],
      },
      {
        id: "delais",
        heading: "3. Estimated Delivery Times",
        paragraphs: ["The timeframes below are estimates and may vary depending on product availability, the exact delivery area, and traffic conditions:"],
        bullets: [
          "Douala: between 30 minutes and 48 hours;",
          "Yaoundé: between 24 and 72 hours;",
          "Other cities: delivery is not yet available outside the areas mentioned above as of today.",
        ],
      },
      {
        id: "suivi",
        heading: "4. Receiving Your Order",
        paragraphs: [
          "In accordance with our Terms of Use, you agree to provide an accurate delivery address and to remain reachable at the phone number given at checkout: our delivery partner may need to contact you directly to arrange the handover of your package.",
          "If you are unavailable when the delivery rider arrives, a further delivery attempt or pickup arrangement will be offered to you through the \"Contact us\" section of the Application.",
        ],
      },
      {
        id: "modifications",
        heading: "5. Changes to This Page",
        paragraphs: [
          "We reserve the right to modify the information on this page at any time, in particular to reflect changes to our delivery areas or timeframes. Any material change shall take effect upon the expiry of a period of forty-eight (48) hours following its publication on this page, such publication being evidenced by the update of the \"Last updated\" date set out at the head of these terms.",
        ],
      },
      {
        id: "contact",
        heading: "6. Contact Us",
        paragraphs: ["For any question relating to the delivery of your order, you can contact us:"],
        bullets: [
          "By email: contact@shopitech.cm",
          "By mail: Shopitech (a subsidiary of iTech Services SARL — itechservices.cm), Akwa Douche, Douala, Cameroon",
          "Through in-app support, by opening a ticket from the \"Contact us\" section",
          "Website: shopitech.cm",
        ],
      },
    ],
  },
};
