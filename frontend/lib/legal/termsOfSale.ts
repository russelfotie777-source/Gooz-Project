import type { Locale } from "../i18n/config";
import type { LegalDocument } from "./legalContent";

// Bilingual content for the /conditions-achat page (Terms of Sale) — governs
// the sales contract itself (order formation, price, payment, retention of
// title, warranty). Distinct from lib/legal/termsOfUse.ts, which governs use
// of the platform (accounts, conduct, IP). Companion documents: Return
// Policy (lib/legal/returnPolicy.ts) and Delivery Fees (lib/legal/deliveryFees.ts).
export const TERMS_OF_SALE: Record<Locale, LegalDocument> = {
  fr: {
    title: "Conditions générales d'achat",
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdated: "17 août 2026",
    tocLabel: "Sommaire",
    intro: [
      "Les présentes Conditions Générales d'Achat (« CGA ») régissent le contrat de vente formé entre Shopitech et tout client passant commande sur l'Application ou le Site Web Shopitech. Elles complètent, sans s'y substituer, nos Conditions Générales d'Utilisation, qui régissent l'utilisation de la plateforme elle-même.",
      "Toute commande passée sur le Service emporte votre acceptation pleine et entière des présentes Conditions Générales d'Achat.",
    ],
    sections: [
      {
        id: "interpretation",
        heading: "1. Interprétation",
        paragraphs: [
          "Les termes en majuscule employés dans les présentes CGA sans y être définis (Application, Société, Service, Pays, Filiale, Site Web, Vous, etc.) ont la signification qui leur est donnée dans nos Conditions Générales d'Utilisation.",
        ],
      },
      {
        id: "processus-commande",
        heading: "2. Processus de commande",
        paragraphs: ["Une commande est passée selon le déroulement suivant :"],
        bullets: [
          "sélection d'un ou plusieurs produits et de leurs variantes (le cas échéant) et ajout au panier ;",
          "connexion à votre Compte, la création d'un Compte étant nécessaire pour finaliser toute commande ;",
          "renseignement de l'adresse de livraison, ou sélection d'un retrait gratuit auprès de l'un de nos entrepôts ;",
          "choix du mode de paiement : paiement en ligne par Mobile Money (MTN Mobile Money, Orange Money) ou par carte bancaire, via l'interface sécurisée de notre prestataire Maviance, ou paiement en espèces à la livraison ou lors du retrait ;",
          "vérification et validation définitive de la commande.",
        ],
      },
      {
        id: "formation-contrat",
        heading: "3. Formation et confirmation du contrat",
        paragraphs: [
          "Pour les commandes réglées en ligne, le contrat de vente n'est formé et la commande n'est considérée comme confirmée qu'après validation du paiement par notre prestataire de paiement, Maviance.",
          "Pour les commandes réglées en espèces, à la livraison ou lors du retrait, la commande est enregistrée avec un statut de paiement en attente dès sa validation ; le contrat de vente n'est définitivement formé qu'au moment du paiement effectif du prix entre vos mains et celles de notre livreur, ou au comptoir de retrait.",
          "Tant que le paiement n'a pas été effectivement reçu par la Société, celle-ci se réserve le droit de ne pas procéder à la remise du produit, ou d'annuler la commande dans les conditions prévues à l'article 5.1 de nos Conditions Générales d'Utilisation.",
        ],
      },
      {
        id: "prix",
        heading: "4. Prix",
        paragraphs: [
          "Les prix des produits sont indiqués en Francs CFA (FCFA), toutes taxes comprises. Ils sont susceptibles d'être modifiés à tout moment, sans préavis, sous réserve que le prix appliqué à une commande soit toujours celui affiché et confirmé au moment de la validation de cette commande.",
          "Dans l'hypothèse où, en raison d'une erreur manifeste (erreur informatique, de saisie ou d'affichage), un produit serait proposé à un prix manifestement dérisoire ou erroné, la Société se réserve le droit d'annuler la commande correspondante après en avoir informé le client, sans que sa responsabilité ne puisse être engagée à ce titre.",
          "Les frais de livraison, lorsqu'ils sont applicables, sont indiqués séparément avant la validation de la commande et détaillés dans notre page Frais de Livraison.",
        ],
      },
      {
        id: "paiement",
        heading: "5. Modalités de paiement",
        paragraphs: ["Le prix est exigible dans son intégralité au moment de la commande ou de la livraison, selon le mode choisi. La Société ne consent aucune vente à crédit ni paiement échelonné."],
        bullets: [
          "Paiement en ligne : par Mobile Money (MTN Mobile Money, Orange Money) ou par carte bancaire, traité par l'interface sécurisée de notre prestataire Maviance.",
          "Paiement en espèces : réglé directement auprès de notre livreur au moment de la livraison, ou au comptoir lors d'un retrait en entrepôt.",
        ],
      },
      {
        id: "reserve-propriete",
        heading: "6. Réserve de propriété",
        paragraphs: [
          "La Société conserve la pleine propriété des produits vendus jusqu'au paiement intégral et effectif du prix par le client, en principal et le cas échéant en frais accessoires. Cette réserve de propriété est particulièrement pertinente pour les commandes réglées en espèces à la livraison ou au retrait, pour lesquelles le transfert de propriété n'intervient qu'au moment du paiement effectif entre les mains de la Société ou de son livreur.",
          "Le transfert des risques de perte ou d'endommagement du produit intervient, quant à lui, à la remise matérielle du produit au client ou à son représentant.",
        ],
      },
      {
        id: "livraison-retrait",
        heading: "7. Livraison et retrait",
        paragraphs: [
          "Vous pouvez choisir de vous faire livrer à l'adresse de votre choix, moyennant les frais de livraison détaillés dans notre page Frais de Livraison, ou de retirer gratuitement votre commande auprès de l'un de nos entrepôts.",
          "Les modalités pratiques de livraison (délais indicatifs, zones desservies) sont précisées dans notre page Frais de Livraison et à l'article 4 de nos Conditions Générales d'Utilisation.",
        ],
      },
      {
        id: "retractation",
        heading: "8. Absence de droit de rétractation discrétionnaire",
        paragraphs: [
          "Sous réserve des dispositions d'ordre public de la loi-cadre n° 2011/012 du 6 mai 2011 portant protection du consommateur au Cameroun, auxquelles il ne saurait être dérogé, la Société n'accorde aucun droit de rétractation discrétionnaire pour simple changement d'avis : un produit livré conforme à la commande et exempt de défaut ne peut faire l'objet ni d'un retour, ni d'un remboursement, ni d'un échange.",
          "Seuls les produits défectueux, endommagés ou non conformes à la commande peuvent faire l'objet d'un retour, dans les conditions détaillées dans notre Politique de Retour.",
        ],
      },
      {
        id: "garantie",
        heading: "9. Garantie de conformité",
        paragraphs: [
          "Les produits vendus bénéficient de la garantie légale de conformité prévue par la loi-cadre n° 2011/012 du 6 mai 2011 portant protection du consommateur au Cameroun. Les modalités pratiques de mise en œuvre de cette garantie (délais, conditions, procédure) sont précisées dans notre Politique de Retour.",
        ],
      },
      {
        id: "preuve",
        heading: "10. Preuve de la transaction",
        paragraphs: [
          "Les registres informatisés conservés dans les systèmes de la Société, dans des conditions raisonnables de sécurité, sont considérés comme les preuves des communications, commandes et paiements intervenus entre les parties, sauf preuve contraire.",
          "Le récapitulatif de chaque commande demeure consultable par le client à tout moment depuis l'historique de commandes de son Compte.",
        ],
      },
      {
        id: "force-majeure",
        heading: "11. Force majeure",
        paragraphs: [
          "La responsabilité de la Société ne pourra être engagée si l'inexécution ou le retard dans l'exécution de l'une de ses obligations décrites dans les présentes CGA découle d'un cas de force majeure, au sens retenu par la jurisprudence et le droit camerounais.",
        ],
      },
      {
        id: "langue",
        heading: "12. Langue du contrat",
        paragraphs: [
          "Les présentes Conditions Générales d'Achat sont rédigées en français. Leur version en anglais, également mise à votre disposition, est fournie à titre de traduction de courtoisie ; en cas de divergence d'interprétation, la version française prévaut.",
        ],
      },
      {
        id: "droit-applicable",
        heading: "13. Droit applicable et règlement des litiges",
        paragraphs: [
          "Les présentes CGA sont soumises au droit camerounais. Nous vous encourageons à nous contacter d'abord à l'amiable, à l'adresse contact@shopitech.cm, afin de tenter de résoudre tout litige. À défaut de résolution amiable, les tribunaux compétents de Douala, Cameroun, seront seuls compétents.",
        ],
      },
      {
        id: "modifications",
        heading: "14. Modifications de ces conditions générales d'achat",
        paragraphs: [
          "Nous nous réservons le droit de modifier les présentes CGA à tout moment. Toute modification entre en vigueur à l'expiration d'un délai de quarante-huit (48) heures suivant sa publication sur cette page. Les commandes déjà confirmées avant l'entrée en vigueur d'une modification demeurent régies par les CGA en vigueur au moment de leur passation.",
        ],
      },
      {
        id: "contact",
        heading: "15. Nous contacter",
        paragraphs: ["Pour toute question relative aux présentes Conditions Générales d'Achat, vous pouvez nous contacter :"],
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
    title: "Terms of Sale",
    lastUpdatedLabel: "Last updated",
    lastUpdated: "August 17, 2026",
    tocLabel: "Table of contents",
    intro: [
      "These Terms of Sale govern the sales contract formed between Shopitech and any customer placing an order on the Shopitech Application or Website. They complement, without replacing, our Terms of Use, which govern use of the platform itself.",
      "Placing an order through the Service constitutes your full and unreserved acceptance of these Terms of Sale.",
    ],
    sections: [
      {
        id: "interpretation",
        heading: "1. Interpretation",
        paragraphs: [
          "Capitalized terms used in these Terms of Sale without being defined herein (Application, Company, Service, Country, Affiliate, Website, You, etc.) have the meaning given to them in our Terms of Use.",
        ],
      },
      {
        id: "processus-commande",
        heading: "2. Order Process",
        paragraphs: ["An order is placed following the sequence below:"],
        bullets: [
          "selection of one or more products and their variants (where applicable) and adding them to the cart;",
          "signing in to your Account, an Account being required to complete any order;",
          "providing a delivery address, or selecting free pickup at one of our warehouses;",
          "choosing a payment method: online payment by Mobile Money (MTN Mobile Money, Orange Money) or by card, through the secure interface of our provider Maviance, or payment in cash on delivery or at pickup;",
          "reviewing and final confirmation of the order.",
        ],
      },
      {
        id: "formation-contrat",
        heading: "3. Formation and Confirmation of the Contract",
        paragraphs: [
          "For orders paid online, the sales contract is formed, and the order is considered confirmed, only once payment has been validated by our payment provider, Maviance.",
          "For orders paid in cash, on delivery or at pickup, the order is recorded with a pending payment status as soon as it is validated; the sales contract is only finally formed once the price has actually been paid, in person, to our delivery rider or at the pickup counter.",
          "For as long as payment has not actually been received by the Company, the Company reserves the right not to hand over the product, or to cancel the order under the conditions set out at article 5.1 of our Terms of Use.",
        ],
      },
      {
        id: "prix",
        heading: "4. Price",
        paragraphs: [
          "Product prices are shown in CFA Francs (FCFA), all taxes included. They may be changed at any time without notice, provided that the price applied to an order shall always be the price displayed and confirmed at the time that order is placed.",
          "Where, due to an obvious error (a computer, data-entry or display error), a product is offered at a manifestly derisory or incorrect price, the Company reserves the right to cancel the corresponding order after notifying the customer, without its liability being engaged in that respect.",
          "Delivery fees, where applicable, are shown separately before the order is confirmed and are detailed in our Delivery Fees page.",
        ],
      },
      {
        id: "paiement",
        heading: "5. Payment Terms",
        paragraphs: ["The price is payable in full at the time of order or delivery, depending on the method chosen. The Company grants no credit sale or instalment payment."],
        bullets: [
          "Online payment: by Mobile Money (MTN Mobile Money, Orange Money) or by card, processed through the secure interface of our provider Maviance.",
          "Cash payment: paid directly to our delivery rider at the time of delivery, or at the counter when picking up an order at a warehouse.",
        ],
      },
      {
        id: "reserve-propriete",
        heading: "6. Retention of Title",
        paragraphs: [
          "The Company retains full ownership of the products sold until the price has been paid in full and actually received from the customer, in principal and, where applicable, in ancillary costs. This retention of title clause is particularly relevant for orders paid in cash on delivery or at pickup, for which ownership does not transfer until the price is actually paid, in person, to the Company or its delivery rider.",
          "The transfer of risk of loss or damage to the product, on the other hand, occurs upon physical handover of the product to the customer or their representative.",
        ],
      },
      {
        id: "livraison-retrait",
        heading: "7. Delivery and Pickup",
        paragraphs: [
          "You may choose to have your order delivered to the address of your choice, subject to the delivery fees detailed in our Delivery Fees page, or to collect it free of charge from one of our warehouses.",
          "The practical delivery terms (estimated timeframes, areas served) are set out in our Delivery Fees page and at article 4 of our Terms of Use.",
        ],
      },
      {
        id: "retractation",
        heading: "8. No Discretionary Right of Withdrawal",
        paragraphs: [
          "Subject to the mandatory provisions of the framework Law No. 2011/012 of May 6, 2011 on consumer protection in Cameroon, which may not be derogated from, the Company grants no discretionary right of withdrawal for a simple change of mind: a product delivered in conformity with the order and free of defect may not be the subject of a return, a refund, or an exchange.",
          "Only defective, damaged, or non-conforming products may be returned, under the terms detailed in our Return Policy.",
        ],
      },
      {
        id: "garantie",
        heading: "9. Warranty of Conformity",
        paragraphs: [
          "Products sold benefit from the legal warranty of conformity provided for under the framework Law No. 2011/012 of May 6, 2011 on consumer protection in Cameroon. The practical terms for exercising this warranty (timeframes, conditions, procedure) are set out in our Return Policy.",
        ],
      },
      {
        id: "preuve",
        heading: "10. Proof of Transaction",
        paragraphs: [
          "The computerized records kept in the Company's systems, under reasonable security conditions, shall be considered proof of the communications, orders and payments exchanged between the parties, unless proven otherwise.",
          "A summary of each order remains available to the customer at any time from the order history in their Account.",
        ],
      },
      {
        id: "force-majeure",
        heading: "11. Force Majeure",
        paragraphs: [
          "The Company's liability may not be engaged if the failure to perform, or delay in performing, any of its obligations described in these Terms of Sale results from an event of force majeure, as recognized under Cameroonian case law and legislation.",
        ],
      },
      {
        id: "langue",
        heading: "12. Language of the Contract",
        paragraphs: [
          "These Terms of Sale are drafted in French. Their English version, also made available to you, is provided as a courtesy translation; in the event of any discrepancy in interpretation, the French version shall prevail.",
        ],
      },
      {
        id: "droit-applicable",
        heading: "13. Governing Law and Dispute Resolution",
        paragraphs: [
          "These Terms of Sale are governed by Cameroonian law. We encourage you to contact us first at contact@shopitech.cm to try to resolve any dispute amicably. Failing an amicable resolution, the competent courts of Douala, Cameroon, shall have exclusive jurisdiction.",
        ],
      },
      {
        id: "modifications",
        heading: "14. Changes to These Terms of Sale",
        paragraphs: [
          "We reserve the right to modify these Terms of Sale at any time. Any modification shall take effect upon the expiry of a period of forty-eight (48) hours following its publication on this page. Orders already confirmed before a modification takes effect remain governed by the Terms of Sale in force at the time they were placed.",
        ],
      },
      {
        id: "contact",
        heading: "15. Contact Us",
        paragraphs: ["If you have any questions about these Terms of Sale, you can contact us:"],
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
