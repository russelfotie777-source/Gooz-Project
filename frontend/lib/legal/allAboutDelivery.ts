import type { Locale } from "../i18n/config";
import type { LegalDocument } from "./legalContent";

// Bilingual content for the /tout-sur-la-livraison page — a practical
// walkthrough of how delivery actually happens (modes, riders, receiving
// your package). Complements Frais de Livraison (lib/legal/deliveryFees.ts),
// which covers zones, fee calculation and timeframes; this page covers the
// day-to-day delivery experience instead of repeating that content.
export const ALL_ABOUT_DELIVERY: Record<Locale, LegalDocument> = {
  fr: {
    title: "Tout sur la livraison",
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdated: "17 août 2026",
    tocLabel: "Sommaire",
    intro: [
      "Cette page vous explique comment se déroule concrètement la livraison de vos commandes Shopitech, du choix du mode de livraison jusqu'à la réception de votre colis. Pour le détail des zones desservies, du calcul des frais et des délais indicatifs, consultez notre page Frais de Livraison.",
    ],
    sections: [
      {
        id: "modes-livraison",
        heading: "1. Nos deux modes de livraison",
        bullets: [
          "Livraison à domicile — à l'adresse de votre choix, moyennant des frais de livraison calculés selon la distance et le nombre d'articles de votre commande.",
          "Retrait en entrepôt — gratuit, auprès de l'un de nos entrepôts, sur présentation d'un justificatif de votre commande.",
        ],
      },
      {
        id: "qui-livre",
        heading: "2. Qui livre vos commandes",
        paragraphs: [
          "Vos commandes sont livrées par nos livreurs partenaires, des professionnels indépendants qui assurent les livraisons à moto. Ils ne reçoivent que les informations strictement nécessaires à la livraison — votre nom, votre numéro de téléphone et votre adresse — voir notre Politique de Confidentialité pour plus de détails.",
        ],
      },
      {
        id: "deroulement",
        heading: "3. Comment se déroule la livraison",
        paragraphs: [
          "Une fois votre commande en cours d'acheminement, notre livreur peut être amené à vous contacter directement au numéro de téléphone renseigné lors de votre commande, notamment pour préciser le lieu de remise ou vous prévenir de son arrivée.",
          "Si vous avez choisi le paiement en espèces, le montant total de votre commande est à régler directement auprès du livreur au moment de la remise du colis, conformément à nos Conditions Générales d'Achat.",
        ],
      },
      {
        id: "reception",
        heading: "4. À la réception de votre colis",
        paragraphs: [
          "Nous vous recommandons de vérifier l'état de votre colis et sa conformité avec votre commande dès sa réception. Si un produit se révèle défectueux, endommagé ou non conforme, conservez son emballage d'origine et l'ensemble de ses accessoires : ces éléments vous seront demandés dans le cadre d'une éventuelle demande de retour, décrite dans notre Politique de Retour.",
        ],
      },
      {
        id: "absence",
        heading: "5. En cas d'absence lors de la livraison",
        paragraphs: [
          "Si vous êtes indisponible au moment du passage de notre livreur, contactez-nous via la rubrique « Nous contacter » de l'Application afin de convenir d'une nouvelle tentative de livraison ou de modalités de retrait alternatives.",
        ],
      },
      {
        id: "zones-delais",
        heading: "6. Zones desservies et délais",
        paragraphs: [
          "Notre zone de couverture s'étend progressivement à de nouvelles villes. La disponibilité de la livraison pour votre adresse, ainsi que les délais indicatifs et le mode de calcul des frais, sont détaillés dans notre page Frais de Livraison.",
        ],
      },
      {
        id: "contact",
        heading: "7. Nous contacter",
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
    title: "All About Delivery",
    lastUpdatedLabel: "Last updated",
    lastUpdated: "August 17, 2026",
    tocLabel: "Table of contents",
    intro: [
      "This page explains how delivery of your Shopitech orders actually works, from choosing a delivery method to receiving your package. For details on delivery areas, how fees are calculated, and estimated timeframes, see our Delivery Fees page.",
    ],
    sections: [
      {
        id: "modes-livraison",
        heading: "1. Our Two Delivery Methods",
        bullets: [
          "Home delivery — to the address of your choice, for a delivery fee calculated based on distance and the number of items in your order.",
          "Warehouse pickup — free of charge, at one of our warehouses, upon presenting proof of your order.",
        ],
      },
      {
        id: "qui-livre",
        heading: "2. Who Delivers Your Orders",
        paragraphs: [
          "Your orders are delivered by our delivery partners, independent riders who handle deliveries by motorcycle. They only receive the information strictly necessary for delivery — your name, phone number, and address — see our Privacy Policy for details.",
        ],
      },
      {
        id: "deroulement",
        heading: "3. How Delivery Works",
        paragraphs: [
          "Once your order is on its way, our delivery rider may contact you directly at the phone number provided with your order, in particular to confirm the exact drop-off point or let you know they're arriving.",
          "If you chose to pay in cash, the full amount of your order is payable directly to the rider when your package is handed over, in accordance with our Terms of Sale.",
        ],
      },
      {
        id: "reception",
        heading: "4. When You Receive Your Package",
        paragraphs: [
          "We recommend checking the condition of your package and that it matches your order as soon as you receive it. If a product turns out to be defective, damaged, or not as ordered, keep its original packaging and all its accessories: these will be required for any return request, as described in our Return Policy.",
        ],
      },
      {
        id: "absence",
        heading: "5. If You're Unavailable at Delivery",
        paragraphs: [
          "If you are unavailable when our rider arrives, contact us through the \"Contact us\" section of the Application to arrange another delivery attempt or an alternative pickup arrangement.",
        ],
      },
      {
        id: "zones-delais",
        heading: "6. Areas Served and Timeframes",
        paragraphs: [
          "Our coverage area is expanding progressively to new cities. Delivery availability for your address, along with estimated timeframes and how fees are calculated, are detailed in our Delivery Fees page.",
        ],
      },
      {
        id: "contact",
        heading: "7. Contact Us",
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
