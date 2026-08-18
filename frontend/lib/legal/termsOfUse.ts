import type { Locale } from "../i18n/config";
import type { LegalDocument } from "./legalContent";

// Bilingual content for the /conditions-utilisation page (Terms of Use for
// the Shopitech mobile app and website) — the companion document to
// lib/legal/privacyPolicy.ts, required alongside it for Google Play
// Console / App Store Connect submissions.
export const TERMS_OF_USE: Record<Locale, LegalDocument> = {
  fr: {
    title: "Conditions générales d'utilisation",
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdated: "14 août 2026",
    tocLabel: "Sommaire",
    intro: [
      "Veuillez lire attentivement ces conditions générales d'utilisation avant d'utiliser l'Application ou le Site Web Shopitech.",
      "Votre accès et votre utilisation du Service sont conditionnés par votre acceptation et le respect des présentes Conditions Générales d'Utilisation. Ces Conditions s'appliquent à tous les visiteurs, utilisateurs et autres personnes qui accèdent au Service ou l'utilisent.",
      "En accédant au Service ou en l'utilisant, vous acceptez d'être lié par ces Conditions. Si vous êtes en désaccord avec une partie quelconque de ces Conditions, vous ne pouvez alors pas accéder au Service.",
    ],
    sections: [
      {
        id: "interpretation-definitions",
        heading: "1. Interprétation et définitions",
        subsections: [
          {
            heading: "Interprétation",
            paragraphs: [
              "Les mots dont la lettre initiale est en majuscule ont une signification définie dans les conditions suivantes. Les définitions suivantes ont la même signification, qu'elles apparaissent au singulier ou au pluriel.",
            ],
          },
          {
            heading: "Définitions",
            paragraphs: ["Aux fins des présentes Conditions Générales d'Utilisation :"],
            bullets: [
              "Application : désigne le logiciel Shopitech fourni par la Société, téléchargeable sur tout appareil électronique.",
              "Filiale : désigne une entité qui contrôle, est contrôlée par, ou est sous contrôle commun avec une partie. iTech Services SARL (itechservices.cm), société mère de Shopitech, est notamment considérée comme une Filiale au sens des présentes Conditions.",
              "Pays : fait référence au Cameroun.",
              "Société (désignée par « la Société », « Nous », « Notre » ou « Nos » dans le présent Accord) : désigne Shopitech, filiale de iTech Services SARL, dont le siège social est situé à Douala, quartier Akwa Douche, Cameroun.",
              "Appareil : tout appareil pouvant accéder au Service, tel qu'un ordinateur, un téléphone portable ou une tablette numérique.",
              "Service : désigne l'Application et/ou le Site Web Shopitech.",
              "Conditions Générales d'Utilisation (également appelées « Conditions ») : désigne les présentes Conditions Générales d'Utilisation qui forment l'accord intégral entre vous et la Société concernant l'utilisation du Service.",
              "Service de Réseau Social Tiers : désigne tout service ou contenu (données, informations, produits ou services) fourni par un tiers pouvant être affiché, inclus ou mis à disposition par le Service, notamment WhatsApp et nos réseaux sociaux.",
              "Site Web : Shopitech, accessible depuis shopitech.cm.",
              "Vous : la personne physique qui accède au Service ou l'utilise, ou la société, ou toute autre entité juridique au nom de laquelle cette personne accède ou utilise le Service, le cas échéant.",
            ],
          },
        ],
      },
      {
        id: "comptes",
        heading: "2. Comptes utilisateurs",
        paragraphs: [
          "Lorsque vous créez un compte chez nous, vous devez fournir des informations exactes, complètes et à jour à tout moment. Le non-respect de cette obligation constitue une violation des présentes Conditions et peut entraîner la résiliation immédiate de votre compte sur notre Service.",
          "Vous êtes responsable de la protection du mot de passe que vous utilisez pour accéder au Service, ainsi que de toute activité ou action effectuée avec votre mot de passe. Vous acceptez de ne divulguer votre mot de passe à aucun tiers. Vous devez nous informer immédiatement dès que vous avez connaissance d'une violation de sécurité ou d'une utilisation non autorisée de votre compte.",
          "Notre Service ne s'adresse à aucune personne âgée de moins de 13 ans, conformément à notre Politique de Confidentialité.",
        ],
      },
      {
        id: "commandes-paiement",
        heading: "3. Commandes, prix et paiement",
        paragraphs: [
          "En passant une commande sur le Service, vous déclarez que vous êtes légalement en mesure de conclure un contrat contraignant.",
        ],
        bullets: [
          "Les prix affichés sur le Service sont exprimés en Francs CFA (FCFA) et peuvent être modifiés à tout moment sans préavis, sauf pour les commandes déjà confirmées.",
          "La disponibilité des produits n'est pas garantie ; en cas de rupture de stock après votre commande, nous vous en informerons et procéderons, selon le cas, à un remboursement ou à une proposition d'échange.",
          "Le paiement s'effectue via l'interface sécurisée de notre prestataire, Maviance (corporate.maviance.cm), par Mobile Money (MTN Mobile Money, Orange Money) ou par carte bancaire. Nous ne recevons de sa part que la confirmation du succès ou de l'échec de la transaction ; voir notre Politique de Confidentialité pour plus de détails.",
          "Une commande n'est considérée comme confirmée qu'après validation du paiement par notre prestataire de paiement.",
        ],
      },
      {
        id: "livraison",
        heading: "4. Livraison",
        paragraphs: [
          "Les zones desservies, le mode de calcul des frais de livraison et les délais indicatifs par ville sont détaillés dans notre page Frais de Livraison, qui fait partie intégrante des présentes Conditions.",
          "Les délais de livraison communiqués lors de la commande sont donnés à titre indicatif et peuvent varier selon la zone géographique, la disponibilité du produit et les conditions de circulation.",
          "Les frais de livraison sont calculés en fonction de votre adresse de livraison et affichés avant la validation de votre commande. La livraison est assurée par nos livreurs partenaires, qui reçoivent uniquement les informations strictement nécessaires à cette fin (voir notre Politique de Confidentialité).",
          "Vous vous engagez à fournir une adresse de livraison exacte et à être joignable au numéro de téléphone communiqué lors de la commande.",
        ],
      },
      {
        id: "annulation-retours",
        heading: "5. Annulation, retours et remboursements",
        subsections: [
          {
            heading: "5.1 Annulation",
            paragraphs: [
              "Toute commande peut être annulée à votre initiative, sans frais, aussi longtemps que la marchandise objet de ladite commande n'a pas quitté l'entrepôt ou les locaux de la Société aux fins d'expédition. Dès lors que la marchandise a quitté l'entrepôt ou les locaux de la Société, la commande est réputée définitive et ne peut plus, en aucun cas, faire l'objet d'une annulation.",
            ],
          },
          {
            heading: "5.2 Retours",
            paragraphs: [
              "Les modalités pratiques et détaillées du processus de retour, notamment la procédure de signalement, l'expertise du produit et le traitement des livraisons effectuées hors de Douala, sont précisées dans notre Politique de Retour, qui fait partie intégrante des présentes Conditions.",
              "Toute demande de retour doit être formée dans un délai de sept (7) jours calendaires à compter de la date de livraison, et donner lieu à une présentation physique du produit au siège de la Société, à Douala.",
              "Par dérogation à ce qui précède, la production de photographies ou de vidéos à titre de preuve du défaut allégué n'est recevable que lorsque le produit a fait l'objet d'une expédition en dehors de la ville de Douala. Dans tous les autres cas, seule la présentation physique du produit au siège de la Société est admise.",
              "La Société se réserve le droit de faire procéder, préalablement à toute décision, à toute expertise ou analyse qu'elle jugera utile aux fins de déterminer si la défectuosité alléguée procède d'un vice de fabrication ou de toute autre cause.",
              "Pour être recevable, le produit retourné doit se trouver dans l'état dans lequel il a été livré, être accompagné de son emballage d'origine ainsi que de l'intégralité de ses accessoires. Le manquement à l'une quelconque de ces conditions rend le retour irrecevable de plein droit.",
              "Lorsqu'il est établi, à l'issue de l'expertise ou de l'analyse susvisée, que la défectuosité résulte d'une mauvaise utilisation ou d'une manipulation inappropriée du produit imputable au client, aucun remboursement ne sera dû par la Société.",
            ],
          },
          {
            heading: "5.3 Remboursements",
            paragraphs: [
              "Les remboursements accordés à l'issue d'un retour jugé recevable sont effectués au moyen du même mode de paiement que celui utilisé lors de l'achat, dans un délai raisonnable à compter de la validation de la demande par la Société.",
            ],
          },
        ],
      },
      {
        id: "avis-contenu",
        heading: "6. Avis et contenu que vous publiez",
        paragraphs: [
          "Notre Service peut vous permettre de publier des avis sur les produits (note et commentaire). Vous êtes seul responsable du contenu que vous publiez et de son exactitude.",
          "Tout avis est soumis à modération avant publication. Nous nous réservons le droit de refuser ou de retirer, à tout moment et sans préavis, tout contenu que nous jugeons faux, trompeur, diffamatoire, offensant, ou qui porte atteinte aux droits d'un tiers.",
          "En publiant un avis, vous nous accordez une licence non exclusive, gratuite et mondiale pour l'utiliser, l'afficher et le reproduire dans le cadre du fonctionnement du Service.",
        ],
      },
      {
        id: "propriete-intellectuelle",
        heading: "7. Propriété intellectuelle",
        paragraphs: [
          "Le Service et son contenu original (à l'exclusion du contenu fourni par vous ou d'autres utilisateurs), ses fonctionnalités et sa fonctionnalité sont et resteront la propriété exclusive de la Société et de ses concédants de licence, notamment sa société mère iTech Services SARL (itechservices.cm).",
          "Le nom « Shopitech », son logo et les marques associées sont des marques de la Société ou de ses affiliés. Vous ne pouvez pas les utiliser en lien avec un produit ou service sans notre accord écrit préalable.",
        ],
      },
      {
        id: "utilisations-interdites",
        heading: "8. Utilisations interdites",
        paragraphs: ["Vous vous engagez à ne pas utiliser le Service :"],
        bullets: [
          "D'une manière qui viole une loi ou une réglementation locale, nationale ou internationale applicable ;",
          "Pour usurper l'identité de la Société, d'un de ses employés, d'un autre utilisateur, ou de toute autre personne ou entité ;",
          "Pour transmettre du matériel publicitaire ou promotionnel non sollicité, ou toute autre forme de sollicitation similaire (« spam ») ;",
          "Pour passer des commandes frauduleuses ou tenter de contourner les systèmes de paiement ou de sécurité du Service ;",
          "Pour tenter d'obtenir un accès non autorisé au Service, aux serveurs, ou aux systèmes ou réseaux connectés au Service.",
        ],
      },
      {
        id: "liens-externes",
        heading: "9. Liens vers d'autres sites web",
        paragraphs: [
          "Notre Service peut contenir des liens vers des sites web ou services tiers qui ne sont pas détenus ni contrôlés par la Société, notamment le site de notre prestataire de paiement Maviance (corporate.maviance.cm), le site de notre société mère iTech Services SARL (itechservices.cm), nos réseaux sociaux, ou WhatsApp.",
          "La Société n'exerce aucun contrôle et n'assume aucune responsabilité quant au contenu, aux politiques de confidentialité ou aux pratiques de tout site ou service tiers. Nous vous conseillons vivement de lire les conditions générales et la politique de confidentialité de tout site tiers que vous visitez.",
        ],
      },
      {
        id: "resiliation",
        heading: "10. Résiliation",
        paragraphs: [
          "Nous pouvons suspendre ou résilier votre accès au Service immédiatement, sans préavis ni responsabilité, pour quelque raison que ce soit, notamment, mais sans s'y limiter, en cas de violation des présentes Conditions.",
          "Vous pouvez également résilier votre compte à tout moment, en supprimant votre compte directement depuis votre profil dans l'Application. En cas de résiliation, votre droit d'utiliser le Service cessera immédiatement.",
        ],
      },
      {
        id: "limitation-responsabilite",
        heading: "11. Limitation de responsabilité",
        paragraphs: [
          "Nonobstant tout dommage que vous pourriez subir, la responsabilité totale de la Société et de l'un quelconque de ses fournisseurs, en vertu de toute disposition des présentes Conditions et pour quelque dommage que ce soit, sera strictement limitée au montant effectivement payé par vous par l'intermédiaire du Service. Si vous n'avez procédé à aucun achat par l'intermédiaire du Service, la responsabilité de la Société ne pourra en aucun cas être engagée à votre égard, et aucune indemnisation ne sera due.",
          "Dans toute la mesure permise par la loi applicable, en aucun cas la Société ou ses fournisseurs ne seront responsables de tout dommage spécial, accessoire, indirect ou consécutif quel qu'il soit.",
        ],
      },
      {
        id: "clause-as-is",
        heading: "12. Clause « TEL QUEL » et « SELON DISPONIBILITÉ »",
        paragraphs: [
          "Le Service vous est fourni « TEL QUEL » et « SELON DISPONIBILITÉ », avec tous les défauts et sans garantie d'aucune sorte. Dans toute la mesure permise par la loi applicable, la Société ne fournit aucune garantie, expresse ou implicite, et décline toutes les garanties légales, statutaires ou autres, y compris, mais sans s'y limiter, les garanties implicites de qualité marchande, d'adéquation à un usage particulier, et d'absence de contrefaçon.",
        ],
      },
      {
        id: "droit-applicable",
        heading: "13. Droit applicable et règlement des litiges",
        paragraphs: [
          "Les lois du Cameroun, à l'exclusion de ses règles sur les conflits de lois, régissent les présentes Conditions et votre utilisation du Service.",
          "Si vous êtes un consommateur résidant au Cameroun, nous vous encourageons à nous contacter d'abord à l'amiable, à l'adresse contact@shopitech.cm, afin de tenter de résoudre tout litige. À défaut de résolution amiable, les tribunaux compétents de Douala, Cameroun, seront seuls compétents pour connaître de tout litige relatif aux présentes Conditions.",
        ],
      },
      {
        id: "divisibilite",
        heading: "14. Divisibilité et renonciation",
        subsections: [
          {
            heading: "Divisibilité",
            paragraphs: [
              "Si une disposition des présentes Conditions est jugée inapplicable ou invalide, cette disposition sera modifiée et interprétée pour atteindre les objectifs de cette disposition dans toute la mesure du possible en vertu de la loi applicable, et les autres dispositions continueront à produire leurs pleins effets.",
            ],
          },
          {
            heading: "Renonciation",
            paragraphs: [
              "Sauf disposition contraire des présentes Conditions, le fait de ne pas exercer un droit ou d'exiger l'exécution d'une obligation en vertu des présentes Conditions n'affecte pas la capacité d'une partie à exercer ce droit ultérieurement, et la renonciation à un manquement ne constitue pas une renonciation à tout manquement ultérieur.",
            ],
          },
        ],
      },
      {
        id: "modifications-cgu",
        heading: "15. Modifications de ces conditions générales d'utilisation",
        paragraphs: [
          "Nous nous réservons le droit, à notre seule discrétion, de modifier ou de remplacer les présentes Conditions à tout moment. Toute modification entre en vigueur à l'expiration d'un délai de quarante-huit (48) heures suivant sa publication sur cette page, laquelle publication est matérialisée par la mise à jour de la date de « Dernière mise à jour » figurant en tête des présentes.",
          "En continuant à accéder à notre Service ou à l'utiliser après l'entrée en vigueur de ces révisions, vous acceptez d'être lié par les Conditions révisées. Si vous n'acceptez pas les nouvelles conditions, en tout ou en partie, veuillez cesser d'utiliser le Service.",
        ],
      },
      {
        id: "contact",
        heading: "16. Nous contacter",
        paragraphs: ["Si vous avez des questions concernant les présentes Conditions Générales d'Utilisation, vous pouvez nous contacter :"],
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
    title: "Terms of Use",
    lastUpdatedLabel: "Last updated",
    lastUpdated: "August 14, 2026",
    tocLabel: "Table of contents",
    intro: [
      "Please read these terms of use carefully before using the Shopitech Application or Website.",
      "Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms of Use. These Terms apply to all visitors, users and others who access or use the Service.",
      "By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of these Terms then you may not access the Service.",
    ],
    sections: [
      {
        id: "interpretation-definitions",
        heading: "1. Interpretation and Definitions",
        subsections: [
          {
            heading: "Interpretation",
            paragraphs: [
              "The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.",
            ],
          },
          {
            heading: "Definitions",
            paragraphs: ["For the purposes of these Terms of Use:"],
            bullets: [
              "Application means the Shopitech software program provided by the Company, downloaded by you on any electronic device.",
              "Affiliate means an entity that controls, is controlled by or is under common control with a party. iTech Services SARL (itechservices.cm), Shopitech's parent company, is in particular considered an Affiliate for the purposes of these Terms.",
              "Country refers to Cameroon.",
              "Company (referred to as either \"the Company\", \"We\", \"Us\" or \"Our\" in this Agreement) refers to Shopitech, a subsidiary of iTech Services SARL, whose registered office is located in Akwa Douche, Douala, Cameroon.",
              "Device means any device that can access the Service, such as a computer, a cellphone or a digital tablet.",
              "Service refers to the Shopitech Application and/or Website.",
              "Terms of Use (also referred to as \"Terms\") mean these Terms of Use that form the entire agreement between you and the Company regarding the use of the Service.",
              "Third-party Social Media Service means any service or content (data, information, products or services) provided by a third party that may be displayed, included or made available by the Service, in particular WhatsApp and our social media pages.",
              "Website refers to Shopitech, accessible from shopitech.cm.",
              "You means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.",
            ],
          },
        ],
      },
      {
        id: "comptes",
        heading: "2. User Accounts",
        paragraphs: [
          "When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.",
          "You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.",
          "Our Service does not address anyone under the age of 13, consistent with our Privacy Policy.",
        ],
      },
      {
        id: "commandes-paiement",
        heading: "3. Orders, Pricing and Payment",
        paragraphs: [
          "By placing an order through the Service, you represent that you are legally capable of entering into a binding contract.",
        ],
        bullets: [
          "Prices displayed on the Service are shown in CFA Francs (FCFA) and may be changed at any time without notice, except for orders already confirmed.",
          "Product availability is not guaranteed; if an item goes out of stock after your order, we will notify you and, as applicable, issue a refund or offer an exchange.",
          "Payment is made through the secure interface of our provider, Maviance (corporate.maviance.cm), via Mobile Money (MTN Mobile Money, Orange Money) or card. We only receive confirmation of whether the transaction succeeded or failed from them; see our Privacy Policy for details.",
          "An order is considered confirmed only once payment has been validated by our payment provider.",
        ],
      },
      {
        id: "livraison",
        heading: "4. Delivery",
        paragraphs: [
          "The areas we deliver to, how delivery fees are calculated, and estimated timeframes by city are detailed in our Delivery Fees page, which forms an integral part of these Terms.",
          "Delivery times shown at checkout are estimates and may vary depending on your geographic area, product availability, and traffic conditions.",
          "Delivery fees are calculated based on your delivery address and shown before you confirm your order. Delivery is carried out by our delivery partners, who only receive the information strictly necessary for that purpose (see our Privacy Policy).",
          "You agree to provide an accurate delivery address and to be reachable at the phone number given at checkout.",
        ],
      },
      {
        id: "annulation-retours",
        heading: "5. Cancellations, Returns and Refunds",
        subsections: [
          {
            heading: "5.1 Cancellation",
            paragraphs: [
              "Any order may be cancelled at your initiative, free of charge, for as long as the merchandise forming the subject matter of such order has not left the Company's warehouse or premises for shipment. Once the merchandise has left the Company's warehouse or premises, the order shall be deemed final and may not, under any circumstances, thereafter be cancelled.",
            ],
          },
          {
            heading: "5.2 Returns",
            paragraphs: [
              "The practical, detailed terms of the return process, in particular the reporting procedure, the product appraisal, and the handling of deliveries made outside Douala, are set out in our Return Policy, which forms an integral part of these Terms.",
              "Any return request must be submitted within a period of seven (7) calendar days from the date of delivery, and must be accompanied by the physical presentation of the product at the Company's head office in Douala.",
              "Notwithstanding the foregoing, photographs or videos shall be admissible as evidence of the alleged defect only where the product was shipped outside the city of Douala. In all other cases, only the physical presentation of the product at the Company's head office shall be accepted.",
              "The Company reserves the right to carry out, or cause to be carried out, prior to any decision, any expert appraisal or analysis it deems appropriate in order to determine whether the alleged defect results from a manufacturing fault or from any other cause.",
              "To be admissible, the returned product must be in the condition in which it was delivered, accompanied by its original packaging and the entirety of its accessories. Failure to satisfy any of these conditions shall render the return inadmissible as of right.",
              "Where it is established, following the aforementioned expert appraisal or analysis, that the defect results from misuse or improper handling of the product attributable to the customer, no refund shall be owed by the Company.",
            ],
          },
          {
            heading: "5.3 Refunds",
            paragraphs: [
              "Refunds granted following a return deemed admissible are issued using the same payment method as that used for the purchase, within a reasonable period following the Company's approval of the request.",
            ],
          },
        ],
      },
      {
        id: "avis-contenu",
        heading: "6. Reviews and Content You Post",
        paragraphs: [
          "Our Service may let you post reviews of products (a rating and a comment). You are solely responsible for the content you post and its accuracy.",
          "All reviews are subject to moderation before publication. We reserve the right, at any time and without notice, to reject or remove any content we deem false, misleading, defamatory, offensive, or infringing on the rights of a third party.",
          "By posting a review, you grant us a non-exclusive, royalty-free, worldwide license to use, display and reproduce it as part of operating the Service.",
        ],
      },
      {
        id: "propriete-intellectuelle",
        heading: "7. Intellectual Property",
        paragraphs: [
          "The Service and its original content (excluding content provided by you or other users), features and functionality are and will remain the exclusive property of the Company and its licensors, including its parent company iTech Services SARL (itechservices.cm).",
          "The Shopitech name, logo, and associated marks are trademarks of the Company or its affiliates. You may not use them in connection with any product or service without our prior written consent.",
        ],
      },
      {
        id: "utilisations-interdites",
        heading: "8. Prohibited Uses",
        paragraphs: ["You agree not to use the Service:"],
        bullets: [
          "In any way that violates any applicable local, national or international law or regulation;",
          "To impersonate the Company, one of its employees, another user, or any other person or entity;",
          "To transmit unsolicited advertising or promotional material, or any other form of similar solicitation (\"spam\");",
          "To place fraudulent orders or attempt to circumvent the Service's payment or security systems;",
          "To attempt to gain unauthorized access to the Service, its servers, or any systems or networks connected to the Service.",
        ],
      },
      {
        id: "liens-externes",
        heading: "9. Links to Other Websites",
        paragraphs: [
          "Our Service may contain links to third-party websites or services that are not owned or controlled by the Company, including our payment provider Maviance (corporate.maviance.cm), our parent company iTech Services SARL (itechservices.cm), our social media pages, or WhatsApp.",
          "The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party sites or services. We strongly advise you to read the terms and conditions and privacy policy of every third-party site you visit.",
        ],
      },
      {
        id: "resiliation",
        heading: "10. Termination",
        paragraphs: [
          "We may suspend or terminate your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.",
          "You may also terminate your account at any time by deleting your account directly from your profile in the Application. Upon termination, your right to use the Service will cease immediately.",
        ],
      },
      {
        id: "limitation-responsabilite",
        heading: "11. Limitation of Liability",
        paragraphs: [
          "Notwithstanding any damages that you might incur, the entire liability of the Company and any of its suppliers under any provision of these Terms, and for whatever damage may arise, shall be strictly limited to the amount actually paid by you through the Service. If you have not made any purchase through the Service, the Company's liability may under no circumstances be engaged towards you, and no indemnification whatsoever shall be owed.",
          "To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever.",
        ],
      },
      {
        id: "clause-as-is",
        heading: "12. \"AS IS\" and \"AS AVAILABLE\" Disclaimer",
        paragraphs: [
          "The Service is provided to you \"AS IS\" and \"AS AVAILABLE\" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company expressly disclaims all warranties, whether express, implied, statutory or otherwise, including, but not limited to, the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.",
        ],
      },
      {
        id: "droit-applicable",
        heading: "13. Governing Law and Dispute Resolution",
        paragraphs: [
          "The laws of Cameroon, excluding its conflicts of law rules, shall govern these Terms and your use of the Service.",
          "If you are a consumer residing in Cameroon, we encourage you to contact us first at contact@shopitech.cm to try to resolve any dispute amicably. Failing an amicable resolution, the competent courts of Douala, Cameroon, shall have exclusive jurisdiction over any dispute relating to these Terms.",
        ],
      },
      {
        id: "divisibilite",
        heading: "14. Severability and Waiver",
        subsections: [
          {
            heading: "Severability",
            paragraphs: [
              "If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.",
            ],
          },
          {
            heading: "Waiver",
            paragraphs: [
              "Except as provided herein, the failure to exercise a right or to require performance of an obligation under these Terms shall not affect a party's ability to exercise such right or require such performance at any time thereafter, nor shall the waiver of a breach constitute a waiver of any subsequent breach.",
            ],
          },
        ],
      },
      {
        id: "modifications-cgu",
        heading: "15. Changes to These Terms of Use",
        paragraphs: [
          "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. Any modification shall take effect upon the expiry of a period of forty-eight (48) hours following its publication on this page, such publication being evidenced by the update of the \"Last updated\" date set out at the head of these Terms.",
          "By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, in whole or in part, please stop using the Service.",
        ],
      },
      {
        id: "contact",
        heading: "16. Contact Us",
        paragraphs: ["If you have any questions about these Terms of Use, you can contact us:"],
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
