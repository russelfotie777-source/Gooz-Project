import type { Locale } from "../i18n/config";
import type { LegalDocument } from "./legalContent";

// Bilingual content for the /politique-retour page — details the return,
// exchange and refund process summarized at article 5 of our Terms of Use
// (lib/legal/termsOfUse.ts), of which it forms an integral part.
export const RETURN_POLICY: Record<Locale, LegalDocument> = {
  fr: {
    title: "Politique de retour",
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdated: "14 août 2026",
    tocLabel: "Sommaire",
    intro: [
      "La présente Politique de Retour précise et complète les modalités de retour, d'échange et de remboursement énoncées à l'article 5 de nos Conditions Générales d'Utilisation. Elle s'applique à tout achat effectué sur l'Application ou le Site Web Shopitech et fait partie intégrante desdites Conditions.",
      "En cas de contradiction entre la présente Politique de Retour et les Conditions Générales d'Utilisation, ces dernières prévalent.",
    ],
    sections: [
      {
        id: "champ-application",
        heading: "1. Champ d'application",
        paragraphs: [
          "Un retour ne peut être accepté que si le produit livré est défectueux, endommagé, ou non conforme à la commande passée (produit erroné, référence différente, quantité incorrecte). À ce jour, la Société n'accorde aucun droit de rétractation pour simple changement d'avis : un produit livré conforme à la commande et exempt de défaut ne peut faire l'objet ni d'un retour, ni d'un remboursement, ni d'un échange.",
        ],
      },
      {
        id: "conditions-eligibilite",
        heading: "2. Conditions d'éligibilité",
        paragraphs: ["Pour être recevable, toute demande de retour doit satisfaire cumulativement aux conditions suivantes :"],
        bullets: [
          "être formée dans un délai de sept (7) jours calendaires à compter de la date de livraison, à défaut de quoi elle sera irrecevable ;",
          "porter sur un produit restitué dans l'état dans lequel il a été livré, accompagné de son emballage d'origine et de l'intégralité de ses accessoires, notices et éléments fournis ;",
          "ne pas résulter d'une mauvaise utilisation, d'une négligence ou d'une manipulation inappropriée du produit imputable au client ;",
          "ne pas porter sur un produit relevant d'une catégorie exclue du droit de retour en vertu de l'article 3.",
        ],
      },
      {
        id: "produits-exclus",
        heading: "3. Produits exclus du retour",
        paragraphs: ["Sont exclus de tout droit de retour, sauf défaut de fabrication dûment établi lors de la livraison :"],
        bullets: [
          "les produits d'hygiène personnelle ou intime dont l'emballage de protection a été descellé ou ouvert ;",
          "les produits confectionnés ou personnalisés à la demande du client (sur mesure, gravure, configuration spécifique) ;",
          "les cartes cadeaux et crédits électroniques ;",
          "les logiciels, licences numériques ou contenus téléchargeables dès lors qu'ils ont été activés ou téléchargés ;",
          "tout produit dont le scellé de sécurité, l'étiquette ou le numéro de série a été retiré, détérioré ou rendu illisible.",
        ],
      },
      {
        id: "procedure",
        heading: "4. Procédure de retour",
        paragraphs: ["La demande de retour est instruite selon la procédure suivante :"],
        bullets: [
          "Signalement — vous nous contactez dans le délai prévu à l'article 2, via la rubrique « Nous contacter » de l'Application, en indiquant le numéro de commande, une description précise du défaut constaté et, le cas échéant, des photographies ou une vidéo du produit.",
          "Présentation du produit — sauf exception prévue à l'article 6 pour les livraisons effectuées hors de la ville de Douala, le produit doit être présenté physiquement au siège de la Société, à Douala (Akwa Douche), accompagné d'un justificatif de la commande.",
          "Expertise — la Société procède, ou fait procéder, à l'examen du produit afin de déterminer si le défaut constaté résulte d'un vice de fabrication ou de toute autre cause, notamment d'une mauvaise utilisation imputable au client.",
          "Décision — la Société vous communique sa décision motivée (acceptation, refus, ou proposition d'échange) dans un délai raisonnable suivant la réception du produit ou, pour les livraisons hors de Douala, suivant la réception des éléments mentionnés à l'article 6.",
          "Remboursement ou échange — en cas d'acceptation, la Société procède, selon votre préférence et sous réserve de disponibilité, au remboursement ou à l'échange du produit, dans les conditions et délais précisés à l'article 5.",
        ],
      },
      {
        id: "remboursement",
        heading: "5. Remboursement",
        paragraphs: [
          "Lorsque le retour est accepté et que le remboursement est retenu, celui-ci est effectué vers le même moyen de paiement que celui utilisé lors de l'achat (Mobile Money ou carte bancaire, via Maviance), dans un délai de sept (7) jours ouvrés à compter de la validation de la demande par la Société.",
          "Les frais de livraison initialement acquittés ne sont remboursés que lorsque le retour résulte d'une erreur imputable à la Société (produit erroné ou non conforme à la commande).",
        ],
      },
      {
        id: "retours-hors-douala",
        heading: "6. Retours pour les livraisons effectuées hors de Douala",
        paragraphs: [
          "Pour toute commande livrée en dehors de la ville de Douala, la présentation physique immédiate du produit n'est pas exigée au stade du signalement : des photographies ou une vidéo du produit et du défaut allégué, transmises via la rubrique « Nous contacter », sont recevables à titre de preuve initiale.",
          "Si, au vu de ces éléments, la Société estime la demande recevable, il appartient alors au client de faire parvenir le produit au siège de la Société à Douala, par les moyens de transport de son choix (agence de voyage, société de transport) et à ses frais exclusifs. La Société n'organise ni ne prend en charge cet acheminement.",
          "L'expertise mentionnée à l'article 4 n'intervient qu'à compter de la réception effective du produit au siège de la Société.",
        ],
      },
      {
        id: "annulation",
        heading: "7. Annulation de commande",
        paragraphs: [
          "L'annulation d'une commande, qu'il convient de distinguer du retour d'un produit déjà livré, est régie par l'article 5.1 de nos Conditions Générales d'Utilisation : elle n'est possible que tant que la marchandise n'a pas quitté l'entrepôt ou les locaux de la Société.",
        ],
      },
      {
        id: "refus-retour",
        heading: "8. Refus de retour",
        paragraphs: ["La Société se réserve le droit de refuser toute demande de retour lorsque :"],
        bullets: [
          "la demande est formée après l'expiration du délai de sept (7) jours prévu à l'article 2 ;",
          "le produit ne remplit pas les conditions d'état, d'emballage ou d'accessoires prévues à l'article 2 ;",
          "le défaut constaté résulte d'une mauvaise utilisation, d'une négligence ou d'une manipulation inappropriée imputable au client ;",
          "le produit relève d'une catégorie exclue en vertu de l'article 3.",
        ],
      },
      {
        id: "modifications",
        heading: "9. Modifications de cette politique",
        paragraphs: [
          "Nous nous réservons le droit de modifier la présente Politique de Retour à tout moment. Toute modification entre en vigueur à l'expiration d'un délai de quarante-huit (48) heures suivant sa publication sur cette page, laquelle publication est matérialisée par la mise à jour de la date de « Dernière mise à jour » figurant en tête des présentes.",
        ],
      },
      {
        id: "contact",
        heading: "10. Nous contacter",
        paragraphs: ["Pour toute demande de retour ou question relative à la présente Politique de Retour, vous pouvez nous contacter :"],
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
    title: "Return Policy",
    lastUpdatedLabel: "Last updated",
    lastUpdated: "August 14, 2026",
    tocLabel: "Table of contents",
    intro: [
      "This Return Policy sets out in detail the return, exchange and refund terms summarized at article 5 of our Terms of Use. It applies to every purchase made on the Shopitech Application or Website and forms an integral part of those Terms.",
      "In the event of any conflict between this Return Policy and the Terms of Use, the Terms of Use shall prevail.",
    ],
    sections: [
      {
        id: "champ-application",
        heading: "1. Scope",
        paragraphs: [
          "A return may only be accepted where the product delivered is defective, damaged, or does not conform to the order placed (wrong product, different reference, incorrect quantity). As of the date hereof, the Company grants no right of withdrawal for a simple change of mind: a product delivered in conformity with the order and free of defect may not be the subject of a return, a refund, or an exchange.",
        ],
      },
      {
        id: "conditions-eligibilite",
        heading: "2. Eligibility Conditions",
        paragraphs: ["To be admissible, a return request must cumulatively satisfy the following conditions:"],
        bullets: [
          "be submitted within a period of seven (7) calendar days from the date of delivery, failing which it shall be inadmissible;",
          "concern a product returned in the condition in which it was delivered, accompanied by its original packaging and the entirety of its accessories, manuals and supplied items;",
          "not result from misuse, negligence, or improper handling of the product attributable to the customer;",
          "not concern a product falling within a category excluded from the right of return under article 3.",
        ],
      },
      {
        id: "produits-exclus",
        heading: "3. Products Excluded from Return",
        paragraphs: ["The following are excluded from any right of return, save for a manufacturing defect duly established upon delivery:"],
        bullets: [
          "personal hygiene or intimate products whose protective packaging has been unsealed or opened;",
          "products manufactured or personalized at the customer's request (made to order, engraving, specific configuration);",
          "gift cards and electronic credits;",
          "software, digital licenses or downloadable content once activated or downloaded;",
          "any product whose security seal, label or serial number has been removed, damaged or rendered illegible.",
        ],
      },
      {
        id: "procedure",
        heading: "4. Return Procedure",
        paragraphs: ["A return request is processed according to the following procedure:"],
        bullets: [
          "Reporting — you contact us within the period set out in article 2, through the \"Contact us\" section of the Application, stating the order number, a precise description of the defect observed and, where applicable, photographs or a video of the product.",
          "Presentation of the product — save for the exception provided at article 6 for deliveries made outside the city of Douala, the product must be physically presented at the Company's head office in Douala (Akwa Douche), together with proof of the order.",
          "Appraisal — the Company carries out, or causes to be carried out, an examination of the product in order to determine whether the observed defect results from a manufacturing fault or from any other cause, in particular misuse attributable to the customer.",
          "Decision — the Company communicates its reasoned decision (acceptance, refusal, or a proposed exchange) within a reasonable time following receipt of the product or, for deliveries outside Douala, following receipt of the items referred to in article 6.",
          "Refund or exchange — where the request is accepted, the Company shall, according to your preference and subject to availability, refund or exchange the product, under the terms and within the timeframes set out in article 5.",
        ],
      },
      {
        id: "remboursement",
        heading: "5. Refund",
        paragraphs: [
          "Where a return is accepted and a refund is chosen, it is issued to the same payment method used for the purchase (Mobile Money or card, via Maviance), within seven (7) business days from the Company's approval of the request.",
          "Original delivery fees are refunded only where the return results from an error attributable to the Company (wrong product or product not conforming to the order).",
        ],
      },
      {
        id: "retours-hors-douala",
        heading: "6. Returns for Deliveries Made Outside Douala",
        paragraphs: [
          "For any order delivered outside the city of Douala, immediate physical presentation of the product is not required at the reporting stage: photographs or a video of the product and of the alleged defect, submitted through the \"Contact us\" section, are admissible as initial evidence.",
          "If, in light of such evidence, the Company considers the request admissible, it is then for the customer to have the product delivered to the Company's head office in Douala, by the means of transport of their choice (travel agency, transport company) and at their own exclusive expense. The Company neither arranges nor bears the cost of that carriage.",
          "The appraisal referred to in article 4 shall only take place upon actual receipt of the product at the Company's head office.",
        ],
      },
      {
        id: "annulation",
        heading: "7. Order Cancellation",
        paragraphs: [
          "The cancellation of an order, which is to be distinguished from the return of a product already delivered, is governed by article 5.1 of our Terms of Use: it is only possible for as long as the merchandise has not left the Company's warehouse or premises.",
        ],
      },
      {
        id: "refus-retour",
        heading: "8. Refusal of Return",
        paragraphs: ["The Company reserves the right to refuse any return request where:"],
        bullets: [
          "the request is submitted after expiry of the seven (7) day period set out in article 2;",
          "the product does not satisfy the condition, packaging or accessory requirements set out in article 2;",
          "the observed defect results from misuse, negligence, or improper handling attributable to the customer;",
          "the product falls within a category excluded under article 3.",
        ],
      },
      {
        id: "modifications",
        heading: "9. Changes to This Policy",
        paragraphs: [
          "We reserve the right to modify this Return Policy at any time. Any modification shall take effect upon the expiry of a period of forty-eight (48) hours following its publication on this page, such publication being evidenced by the update of the \"Last updated\" date set out at the head of these terms.",
        ],
      },
      {
        id: "contact",
        heading: "10. Contact Us",
        paragraphs: ["For any return request or question relating to this Return Policy, you can contact us:"],
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
