import type { Locale } from "../i18n/config";
import type { LegalDocument } from "./legalContent";

// Bilingual content for the /a-propos page. Kept strictly factual per the
// user's instruction: no invented founding year, mission statement, or
// marketing tagline — only facts verified from the codebase (Shopitech's
// relationship to iTech Services SARL, real product categories) or from
// itechservices.cm itself.
export const ABOUT_US: Record<Locale, LegalDocument> = {
  fr: {
    title: "À propos de Shopitech",
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdated: "17 août 2026",
    tocLabel: "Sommaire",
    intro: ["Découvrez qui se trouve derrière Shopitech."],
    sections: [
      {
        id: "qui-sommes-nous",
        heading: "1. Qui sommes-nous",
        paragraphs: [
          "Shopitech est une plateforme de vente en ligne, filiale de iTech Services SARL, dont le siège social est situé à Douala, quartier Akwa Douche, au Cameroun.",
        ],
      },
      {
        id: "societe-mere",
        heading: "2. iTech Services SARL, notre société mère",
        paragraphs: [
          "iTech Services SARL est une entreprise camerounaise de solutions informatiques basée à Douala, spécialisée dans la vente et la maintenance de matériel informatique, la conception et l'installation d'infrastructures réseau, les systèmes de vidéosurveillance ainsi que les solutions de géolocalisation GPS.",
        ],
      },
      {
        id: "catalogue",
        heading: "3. Ce que vous trouverez sur Shopitech",
        paragraphs: ["Notre catalogue est centré sur l'électronique et les équipements technologiques :"],
        bullets: ["Électronique", "Électroménager", "Matériel informatique", "Matériel réseau"],
      },
      {
        id: "livraison-paiement",
        heading: "4. Livraison et paiement",
        paragraphs: [
          "Vous pouvez vous faire livrer à l'adresse de votre choix ou retirer gratuitement votre commande auprès de l'un de nos entrepôts — voir nos pages Frais de Livraison et Tout sur la Livraison.",
          "Le paiement s'effectue en ligne par Mobile Money (MTN Mobile Money, Orange Money) ou par carte bancaire, via notre prestataire Maviance, ou en espèces à la livraison ou au retrait.",
        ],
      },
      {
        id: "contact",
        heading: "5. Nous contacter",
        paragraphs: ["Pour toute question, vous pouvez nous contacter :"],
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
    title: "About Shopitech",
    lastUpdatedLabel: "Last updated",
    lastUpdated: "August 17, 2026",
    tocLabel: "Table of contents",
    intro: ["Find out who's behind Shopitech."],
    sections: [
      {
        id: "qui-sommes-nous",
        heading: "1. Who We Are",
        paragraphs: [
          "Shopitech is an online shopping platform, a subsidiary of iTech Services SARL, whose registered office is located in Akwa Douche, Douala, Cameroon.",
        ],
      },
      {
        id: "societe-mere",
        heading: "2. iTech Services SARL, Our Parent Company",
        paragraphs: [
          "iTech Services SARL is a Cameroonian IT solutions company based in Douala, specializing in the sale and maintenance of computer equipment, the design and installation of network infrastructure, video surveillance systems, and GPS tracking solutions.",
        ],
      },
      {
        id: "catalogue",
        heading: "3. What You'll Find on Shopitech",
        paragraphs: ["Our catalog is focused on electronics and technology equipment:"],
        bullets: ["Electronics", "Home Appliances", "Computer Equipment", "Networking Equipment"],
      },
      {
        id: "livraison-paiement",
        heading: "4. Delivery and Payment",
        paragraphs: [
          "You can have your order delivered to the address of your choice, or collect it free of charge from one of our warehouses — see our Delivery Fees and All About Delivery pages.",
          "Payment is made online by Mobile Money (MTN Mobile Money, Orange Money) or by card, through our provider Maviance, or in cash on delivery or at pickup.",
        ],
      },
      {
        id: "contact",
        heading: "5. Contact Us",
        paragraphs: ["For any question, you can contact us:"],
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
