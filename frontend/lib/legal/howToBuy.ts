import type { Locale } from "../i18n/config";
import type { LegalDocument } from "./legalContent";

// Bilingual content for the /comment-acheter page — a practical step-by-step
// buying guide (not a legal document), reusing the same LegalArticle layout
// as the legal pages for visual consistency. Reflects the real checkout flow
// (account required, delivery-or-pickup, online-or-cash payment).
export const HOW_TO_BUY: Record<Locale, LegalDocument> = {
  fr: {
    title: "Comment acheter sur Shopitech ?",
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdated: "17 août 2026",
    tocLabel: "Sommaire",
    intro: [
      "Ce guide vous accompagne pas à pas, de la recherche d'un produit à la réception de votre commande.",
    ],
    sections: [
      {
        id: "trouver-produit",
        heading: "1. Trouvez votre produit",
        paragraphs: [
          "Parcourez notre catalogue par catégorie depuis la page d'accueil, ou utilisez la barre de recherche en haut de l'écran pour trouver directement un produit par son nom.",
        ],
      },
      {
        id: "fiche-produit",
        heading: "2. Consultez la fiche produit",
        paragraphs: [
          "Sur la fiche d'un produit, vous retrouvez sa description, son prix, ses photos et, lorsque le produit existe en plusieurs versions, les variantes disponibles (taille, couleur, matière...). Choisissez la variante souhaitée avant de l'ajouter à votre panier ; sa disponibilité en stock est vérifiée automatiquement.",
        ],
      },
      {
        id: "panier",
        heading: "3. Ajoutez au panier",
        paragraphs: [
          "Ajoutez un ou plusieurs produits à votre panier. Vous pouvez à tout moment consulter votre panier, modifier les quantités ou retirer un article, avant de passer à la validation de votre commande.",
        ],
      },
      {
        id: "compte",
        heading: "4. Connectez-vous ou créez un compte",
        paragraphs: [
          "Un compte Shopitech est nécessaire pour finaliser une commande. Si vous n'en avez pas encore, la création d'un compte ne prend qu'un instant. Un compte vous permet également d'enregistrer vos adresses de livraison et de consulter l'historique de vos commandes.",
        ],
      },
      {
        id: "livraison-retrait",
        heading: "5. Choisissez la livraison ou le retrait",
        paragraphs: [
          "Deux options s'offrent à vous : vous faire livrer à l'adresse de votre choix, moyennant des frais de livraison calculés automatiquement selon votre localisation et le nombre d'articles (voir notre page Frais de Livraison), ou retirer gratuitement votre commande auprès de l'un de nos entrepôts.",
          "Si vous choisissez la livraison, pensez à renseigner une adresse précise et à rester joignable au numéro de téléphone indiqué : notre livreur pourra avoir besoin de vous contacter.",
        ],
      },
      {
        id: "paiement",
        heading: "6. Choisissez votre mode de paiement",
        paragraphs: ["Deux modes de paiement sont disponibles :"],
        bullets: [
          "En ligne, par Mobile Money (MTN Mobile Money, Orange Money) ou par carte bancaire, via l'interface sécurisée de notre prestataire Maviance ;",
          "En espèces, réglées directement auprès de notre livreur à la livraison, ou au comptoir lors du retrait en entrepôt.",
        ],
      },
      {
        id: "validation",
        heading: "7. Validez votre commande",
        paragraphs: [
          "Vérifiez le récapitulatif de votre commande (articles, adresse, mode de livraison, mode de paiement, montant total) puis validez. Vous recevez une confirmation dès l'enregistrement de votre commande.",
        ],
      },
      {
        id: "suivi",
        heading: "8. Suivez votre commande",
        paragraphs: [
          "Retrouvez à tout moment l'ensemble de vos commandes, leur statut et leur détail depuis la rubrique « Mes commandes » de votre profil.",
        ],
      },
      {
        id: "besoin-aide",
        heading: "9. Besoin d'aide ?",
        paragraphs: [
          "Si un produit reçu est défectueux, endommagé ou ne correspond pas à votre commande, consultez notre Politique de Retour pour connaître la marche à suivre. Pour toute autre question, la rubrique « Nous contacter » de l'Application vous permet d'ouvrir un ticket auprès de notre équipe.",
        ],
      },
    ],
  },
  en: {
    title: "How to Buy on Shopitech",
    lastUpdatedLabel: "Last updated",
    lastUpdated: "August 17, 2026",
    tocLabel: "Table of contents",
    intro: [
      "This guide walks you through every step, from finding a product to receiving your order.",
    ],
    sections: [
      {
        id: "trouver-produit",
        heading: "1. Find Your Product",
        paragraphs: [
          "Browse our catalog by category from the home page, or use the search bar at the top of the screen to find a product directly by name.",
        ],
      },
      {
        id: "fiche-produit",
        heading: "2. Check the Product Page",
        paragraphs: [
          "On a product's page, you'll find its description, price, photos and, when the product comes in several versions, the available variants (size, color, material...). Choose the variant you want before adding it to your cart; its stock availability is checked automatically.",
        ],
      },
      {
        id: "panier",
        heading: "3. Add to Cart",
        paragraphs: [
          "Add one or more products to your cart. You can check your cart, change quantities, or remove an item at any time before confirming your order.",
        ],
      },
      {
        id: "compte",
        heading: "4. Sign In or Create an Account",
        paragraphs: [
          "A Shopitech account is required to complete an order. If you don't have one yet, creating one only takes a moment. An account also lets you save your delivery addresses and view your order history.",
        ],
      },
      {
        id: "livraison-retrait",
        heading: "5. Choose Delivery or Pickup",
        paragraphs: [
          "You have two options: have your order delivered to the address of your choice, for a delivery fee calculated automatically based on your location and the number of items (see our Delivery Fees page), or collect your order free of charge from one of our warehouses.",
          "If you choose delivery, make sure to provide an accurate address and to remain reachable at the phone number you give: our delivery rider may need to contact you.",
        ],
      },
      {
        id: "paiement",
        heading: "6. Choose Your Payment Method",
        paragraphs: ["Two payment methods are available:"],
        bullets: [
          "Online, by Mobile Money (MTN Mobile Money, Orange Money) or by card, through the secure interface of our provider Maviance;",
          "In cash, paid directly to our delivery rider on delivery, or at the counter when picking up your order at a warehouse.",
        ],
      },
      {
        id: "validation",
        heading: "7. Confirm Your Order",
        paragraphs: [
          "Review your order summary (items, address, delivery method, payment method, total amount) and confirm. You receive a confirmation as soon as your order is recorded.",
        ],
      },
      {
        id: "suivi",
        heading: "8. Track Your Order",
        paragraphs: [
          "Find all your orders, their status and their details at any time from the \"My Orders\" section of your profile.",
        ],
      },
      {
        id: "besoin-aide",
        heading: "9. Need Help?",
        paragraphs: [
          "If a product you received is defective, damaged, or does not match your order, check our Return Policy to find out what to do. For any other question, the \"Contact us\" section of the Application lets you open a ticket with our team.",
        ],
      },
    ],
  },
};
