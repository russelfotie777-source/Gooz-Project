import type { Locale } from "../i18n/config";
import type { LegalDocument } from "./legalContent";

// Bilingual content for the /politique-confidentialite page (required by
// Google Play Console / App Store Connect before a listing can go live).
export const PRIVACY_POLICY: Record<Locale, LegalDocument> = {
  fr: {
    title: "Politique de confidentialité",
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdated: "14 août 2026",
    tocLabel: "Sommaire",
    intro: [
      "La présente Politique de Confidentialité décrit nos politiques et procédures concernant la collecte, l'utilisation et la divulgation de vos informations lorsque vous utilisez le Service, et vous informe de vos droits en matière de confidentialité ainsi que de la manière dont la loi vous protège.",
      "Nous utilisons vos données personnelles pour fournir et améliorer le Service. En utilisant le Service, vous acceptez la collecte et l'utilisation d'informations conformément à la présente Politique de Confidentialité.",
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
            paragraphs: ["Aux fins de la présente Politique de Confidentialité :"],
            bullets: [
              "Compte : désigne un compte unique créé pour vous permettre d'accéder à notre Service ou à certaines parties de notre Service.",
              "Filiale : désigne une entité qui contrôle, est contrôlée par, ou est sous contrôle commun avec une partie, où « contrôle » signifie la détention de 50 % ou plus des actions, participations ou autres titres habilités à voter pour l'élection des administrateurs ou de toute autre autorité de gestion. iTech Services SARL (itechservices.cm), société mère de Shopitech, est notamment considérée comme une Filiale au sens de la présente Politique.",
              "Application : désigne le logiciel Shopitech fourni par la Société, téléchargeable sur tout appareil électronique.",
              "Société (désignée par « la Société », « Nous », « Notre » ou « Nos » dans le présent document) : désigne Shopitech, filiale de iTech Services SARL, dont le siège social est situé à Douala, quartier Akwa Douche, Cameroun.",
              "Pays : fait référence au Cameroun.",
              "Appareil : tout appareil pouvant accéder au Service, tel qu'un ordinateur, un téléphone portable ou une tablette numérique.",
              "Données Personnelles : toute information se rapportant à une personne physique identifiée ou identifiable.",
              "Service : désigne l'Application et/ou le Site Web Shopitech.",
              "Prestataire de Services : toute personne physique ou morale qui traite les données pour le compte de la Société, fournit le Service en notre nom, exécute le Service ou nous assiste dans l'analyse de son utilisation. Sont notamment concernés notre partenaire de traitement des paiements Maviance (corporate.maviance.cm), pour le Mobile Money et la carte bancaire, ainsi que nos hébergeurs et prestataires techniques.",
              "Données d'Utilisation : les données collectées automatiquement, générées par l'utilisation du Service ou par l'infrastructure du Service elle-même (par exemple, la durée d'une visite de page).",
              "Site Web : Shopitech, accessible depuis shopitech.cm.",
              "Vous : la personne physique qui accède au Service ou l'utilise.",
            ],
          },
        ],
      },
      {
        id: "collecte-utilisation",
        heading: "2. Collecte et utilisation de vos données personnelles",
        subsections: [
          {
            heading: "2.1 Données personnelles que nous collectons",
            paragraphs: [
              "Lorsque vous utilisez notre Service, nous pouvons vous demander de nous fournir certaines informations personnelles nominatives permettant de vous contacter ou de vous identifier :",
            ],
            bullets: [
              "Nom et prénom",
              "Adresse e-mail",
              "Numéro de téléphone",
              "Adresse(s) de livraison et de facturation (rue, ville, région, indications de localisation)",
              "Mot de passe de votre Compte (toujours stocké sous forme chiffrée, jamais en clair)",
              "Historique de vos commandes et contenu de votre panier",
              "Contenu des tickets d'assistance ou messages que vous nous adressez (formulaire de contact, WhatsApp)",
              "Un identifiant de notification push, uniquement si vous autorisez les notifications sur votre appareil",
            ],
          },
          {
            heading: "Précision sur les données de paiement",
            paragraphs: [
              "Shopitech ne collecte, ne stocke ni ne traite jamais directement vos identifiants de paiement complets (numéro de carte bancaire, code confidentiel Mobile Money). Ces informations sont saisies et traitées exclusivement sur l'interface sécurisée de notre prestataire de paiement, Maviance, selon sa propre politique de confidentialité, consultable sur son site officiel corporate.maviance.cm. Nous ne recevons de sa part que la confirmation du succès ou de l'échec de la transaction.",
            ],
          },
          {
            heading: "2.2 Données d'utilisation",
            paragraphs: [
              "Les Données d'Utilisation sont collectées automatiquement lors de l'utilisation du Service. Elles peuvent inclure des informations telles que l'adresse IP de votre appareil, le type et la version de votre navigateur, les pages de notre Service que vous visitez, la date et l'heure de votre visite, le temps passé sur ces pages, des identifiants uniques de l'appareil et d'autres données de diagnostic.",
              "Lorsque vous accédez au Service par ou via un appareil mobile, nous pouvons collecter automatiquement certaines informations, notamment le type d'appareil mobile que vous utilisez, l'identifiant unique de votre appareil mobile, l'adresse IP de votre appareil mobile, votre système d'exploitation mobile, le type de navigateur Internet mobile que vous utilisez.",
            ],
          },
          {
            heading: "2.3 Technologies de suivi et cookies",
            paragraphs: [
              "Nous utilisons des cookies et des technologies de suivi similaires (balises web, scripts, identifiants de stockage local) pour suivre l'activité sur notre Service et conserver certaines informations. Les cookies sont des fichiers de petite taille pouvant contenir un identifiant unique anonyme, envoyés à votre navigateur depuis un site web et stockés sur votre appareil. Les technologies de suivi utilisées sont des balises, tags et scripts destinés à collecter et suivre l'information, et à améliorer et analyser notre Service.",
              "Vous pouvez configurer votre navigateur pour refuser tous les cookies ou pour indiquer quand un cookie est envoyé. Toutefois, si vous n'acceptez pas les cookies, il se peut que vous ne puissiez pas utiliser certaines parties de notre Service (par exemple, rester connecté ou conserver vos préférences de langue).",
            ],
          },
          {
            heading: "Types de cookies que nous utilisons",
            bullets: [
              "Cookies Nécessaires / Essentiels — cookies de session. Administrés par : Nous. Finalité : ils sont indispensables pour vous fournir les services disponibles sur le Site Web et vous permettre d'utiliser certaines de ses fonctionnalités. Sans ces cookies, les services que vous avez demandés ne peuvent pas être fournis, et nous n'utilisons ces cookies que pour vous fournir ces services.",
              "Cookies de Préférence — cookies persistants. Administrés par : Nous. Finalité : ils nous permettent de mémoriser les choix que vous faites lorsque vous utilisez le Site Web, comme la mémorisation de vos préférences de langue (cookie shopitech-locale). Le but de ces cookies est de vous offrir une expérience plus personnelle et de vous éviter d'avoir à ressaisir vos préférences à chaque visite.",
              "Cookies Analytiques et Cookies Publicitaires / Marketing — nous n'utilisons actuellement aucun cookie tiers d'analyse d'audience ou de publicité ciblée (tel que Google Analytics ou un pixel publicitaire). Si nous venions à en intégrer à l'avenir, cette section serait mise à jour au préalable pour vous en informer et, le cas échéant, recueillir votre consentement.",
            ],
          },
          {
            heading: "Stockage local (hors cookies)",
            paragraphs: [
              "En complément des cookies, l'Application utilise le stockage local de votre navigateur (localStorage) pour conserver, le temps de votre session, un jeton de connexion sécurisé qui vous évite d'avoir à vous reconnecter à chaque visite. Contrairement à un cookie, cette donnée n'est pas transmise automatiquement à chaque requête et reste stockée uniquement sur votre appareil, jusqu'à votre déconnexion ou la suppression de vos données de navigation.",
            ],
          },
          {
            heading: "2.4 Utilisation de vos données personnelles",
            paragraphs: ["La Société peut utiliser les Données Personnelles aux fins suivantes :"],
            bullets: [
              "Fournir et maintenir notre Service, y compris pour suivre l'utilisation de notre Service.",
              "Gérer votre Compte : gérer votre inscription en tant qu'utilisateur du Service, vous donner accès aux différentes fonctionnalités disponibles pour les utilisateurs enregistrés.",
              "Exécuter un contrat : le développement, la mise en conformité et l'engagement du contrat d'achat pour les produits ou services que vous avez achetés, ainsi que l'organisation de leur livraison.",
              "Vous contacter : par e-mail, appel téléphonique, SMS, notification push ou tout autre moyen de communication équivalent, concernant les mises à jour ou communications informatives liées aux fonctionnalités, produits ou services contractés, y compris les mises à jour de sécurité, lorsque cela est nécessaire ou raisonnable pour leur mise en œuvre.",
              "Vous fournir des actualités, offres spéciales et informations générales sur d'autres biens, services et évènements que nous proposons, similaires à ceux que vous avez déjà achetés, sauf si vous avez choisi de ne pas recevoir ce type d'informations.",
              "Gérer vos demandes : assister et gérer vos demandes auprès de nous, y compris les tickets d'assistance que vous ouvrez.",
              "Réaliser des transferts d'entreprise : nous pouvons utiliser vos informations pour évaluer ou réaliser une fusion, une cession, une restructuration, une réorganisation, une dissolution ou toute autre vente ou transfert de tout ou partie de nos actifs.",
              "À d'autres fins : nous pouvons utiliser vos informations à d'autres fins, telles que l'analyse de données, l'identification des tendances d'utilisation, l'évaluation de l'efficacité de nos campagnes et l'amélioration de notre Service.",
            ],
          },
          {
            heading: "2.5 Partage de vos données personnelles",
            paragraphs: ["Nous pouvons partager vos informations personnelles dans les situations suivantes :"],
            bullets: [
              "Avec des Prestataires de Services, en particulier avec Maviance pour le traitement de vos paiements par Mobile Money (MTN Mobile Money, Orange Money) et par carte bancaire, et avec nos hébergeurs pour la surveillance et l'analyse de l'utilisation de notre Service.",
              "Avec nos livreurs partenaires, pour l'exécution matérielle de vos livraisons : nous leur communiquons uniquement votre nom, votre numéro de téléphone et votre adresse de livraison, strictement nécessaires à cette fin. Ces livreurs sont des travailleurs indépendants tenus au respect de la confidentialité de ces informations.",
              "Lors de transferts d'entreprise, dans le cadre ou au cours de négociations de toute fusion, vente d'actifs de la Société, financement ou acquisition de tout ou partie de notre activité par une autre société.",
              "Avec nos Affiliés, notamment notre société mère iTech Services SARL et toute autre filiale du même groupe, auquel cas nous exigerons d'eux qu'ils respectent la présente Politique de Confidentialité.",
              "Avec votre consentement, pour toute autre finalité, avec votre accord préalable.",
            ],
          },
          {
            heading: "2.6 Conservation de vos données personnelles",
            paragraphs: [
              "La Société ne conservera vos Données Personnelles que le temps nécessaire aux fins énoncées dans la présente Politique de Confidentialité. Nous conserverons et utiliserons vos Données Personnelles dans la mesure nécessaire pour nous conformer à nos obligations légales (par exemple, si nous sommes tenus de conserver vos données pour nous conformer aux lois fiscales, comptables et commerciales applicables au Cameroun), résoudre les litiges et faire respecter nos accords et politiques légales.",
              "La Société conservera également les Données d'Utilisation à des fins d'analyse interne. Ces Données d'Utilisation sont généralement conservées pendant une période plus courte, sauf lorsque ces données sont utilisées pour renforcer la sécurité ou pour améliorer la fonctionnalité de notre Service, ou lorsque nous sommes légalement obligés de conserver ces données plus longtemps.",
              "Si vous supprimez votre compte, votre profil (nom, coordonnées) est anonymisé. L'historique de vos commandes passées est néanmoins conservé sous forme anonyme, à des fins comptables et pour satisfaire à nos obligations légales : il n'est alors plus rattaché à votre identité et n'est plus accessible depuis un compte utilisateur.",
            ],
          },
          {
            heading: "2.7 Transfert de vos données personnelles",
            paragraphs: [
              "Vos informations, y compris vos Données Personnelles, sont traitées dans les bureaux d'exploitation de la Société et dans tout autre lieu où se trouvent les parties impliquées dans le traitement, ce qui signifie que ces informations peuvent être transférées vers — et conservées sur — des ordinateurs situés en dehors de votre État, province, pays ou autre juridiction gouvernementale où les lois relatives à la protection des données peuvent différer de celles de votre juridiction.",
              "Votre consentement à la présente Politique de Confidentialité, suivi de la soumission de ces informations, représente votre accord à ce transfert. La Société prendra toutes les mesures raisonnablement nécessaires pour garantir que vos données sont traitées en toute sécurité et conformément à la présente Politique de Confidentialité, et aucun transfert de vos Données Personnelles n'aura lieu vers une organisation ou un pays sans qu'un contrôle adéquat, incluant la sécurité de vos données et autres informations personnelles, ne soit mis en place.",
            ],
          },
        ],
      },
      {
        id: "modification-suppression",
        heading: "3. Modification et suppression de vos données personnelles",
        paragraphs: [
          "Vous avez le droit de faire corriger, mettre à jour ou supprimer les informations que nous avons collectées à votre sujet.",
        ],
        bullets: [
          "Vous pouvez à tout moment modifier vos informations de profil et gérer vos adresses de livraison (ajout, modification, suppression, adresse par défaut) directement depuis la section « Mon Compte » de l'application.",
          "Vous pouvez demander la suppression définitive de votre compte directement depuis votre profil, dans la rubrique dédiée. Cette action, précédée d'un avertissement clair et d'une confirmation par mot de passe, est irréversible : elle entraîne l'anonymisation de vos données personnelles.",
          "Vous pouvez également nous contacter à tout moment à l'adresse contact@shopitech.cm pour exercer ces droits ou pour toute question relative à vos données personnelles.",
        ],
      },
      {
        id: "divulgation",
        heading: "4. Divulgation de vos données personnelles",
        subsections: [
          {
            heading: "4.1 Transactions commerciales",
            paragraphs: [
              "Si la Société est impliquée dans une fusion, une acquisition ou une vente d'actifs, vos Données Personnelles pourront être transférées. Nous vous avertirons avant que vos Données Personnelles ne soient transférées et soumises à une Politique de Confidentialité différente.",
            ],
          },
          {
            heading: "4.2 Application de la loi",
            paragraphs: [
              "Dans certaines circonstances, la Société peut être tenue de divulguer vos Données Personnelles si la loi l'exige ou en réponse à des demandes valables émanant des autorités publiques camerounaises compétentes, notamment dans le cadre de la loi n° 2010/012 du 21 décembre 2010 relative à la cybersécurité et à la cybercriminalité au Cameroun.",
            ],
          },
          {
            heading: "4.3 Autres exigences légales",
            paragraphs: ["La Société peut divulguer vos Données Personnelles de bonne foi lorsqu'une telle action est nécessaire pour :"],
            bullets: [
              "se conformer à une obligation légale ;",
              "protéger et défendre les droits ou la propriété de la Société ;",
              "prévenir ou enquêter sur d'éventuels actes répréhensibles en lien avec le Service, tels qu'une fraude au paiement ou l'usage frauduleux d'un compte ;",
              "protéger la sécurité personnelle des utilisateurs du Service ou du public ;",
              "se protéger contre la responsabilité légale.",
            ],
          },
        ],
      },
      {
        id: "securite",
        heading: "5. Sécurité de vos données personnelles",
        paragraphs: [
          "La sécurité de vos Données Personnelles est importante pour nous, mais n'oubliez pas qu'aucune méthode de transmission sur Internet ou méthode de stockage électronique n'est sûre à 100 %. Bien que nous nous efforcions d'utiliser des moyens commercialement acceptables pour protéger vos Données Personnelles — mots de passe stockés sous forme chiffrée, connexions sécurisées HTTPS, jetons d'authentification à durée limitée — nous ne pouvons garantir leur sécurité absolue.",
        ],
      },
      {
        id: "protection-enfants",
        heading: "6. Protection des enfants",
        paragraphs: [
          "Notre Service ne s'adresse à aucune personne âgée de moins de 13 ans. Nous ne collectons pas sciemment de données à caractère personnel auprès de personnes de moins de 13 ans. Si vous êtes un parent ou un tuteur et que vous avez connaissance du fait que votre enfant nous a fourni des Données Personnelles, veuillez nous contacter à contact@shopitech.cm.",
          "Si nous prenons conscience d'avoir collecté des Données Personnelles auprès d'une personne de moins de 13 ans sans vérification du consentement parental, nous prenons des mesures pour supprimer ces informations de nos serveurs dans les meilleurs délais.",
        ],
      },
      {
        id: "liens-externes",
        heading: "7. Liens vers d'autres sites web",
        paragraphs: [
          "Notre Service peut contenir des liens vers des sites web qui ne sont pas exploités par nous. C'est notamment le cas lorsque vous êtes redirigé vers l'interface sécurisée de notre prestataire de paiement Maviance (corporate.maviance.cm) pour finaliser un paiement par Mobile Money ou par carte bancaire, ou lorsque vous suivez un lien vers nos réseaux sociaux, vers le site de notre société mère iTech Services SARL (itechservices.cm) ou vers WhatsApp.",
          "Si vous cliquez sur un lien tiers, vous serez dirigé vers le site de ce tiers. Nous vous conseillons vivement de consulter la politique de confidentialité de chaque site que vous visitez. Nous n'avons aucun contrôle sur le contenu, les politiques de confidentialité ou les pratiques de tout site ou service tiers, et n'assumons aucune responsabilité à leur égard.",
        ],
      },
      {
        id: "modifications-politique",
        heading: "8. Modifications de cette politique de confidentialité",
        paragraphs: [
          "Nous pouvons mettre à jour notre Politique de Confidentialité de temps à autre. Nous vous informerons de tout changement en publiant la nouvelle Politique de Confidentialité sur cette page et en mettant à jour la date de « Dernière mise à jour » en haut de la présente Politique de Confidentialité.",
          "Nous vous conseillons de consulter cette Politique de Confidentialité périodiquement pour prendre connaissance de tout changement. Les modifications apportées à cette Politique de Confidentialité entrent en vigueur au moment où elles sont publiées sur cette page.",
        ],
      },
      {
        id: "contact",
        heading: "9. Nous contacter",
        paragraphs: [
          "Si vous avez des questions concernant la présente Politique de Confidentialité ou sur la manière dont nous traitons vos données personnelles, vous pouvez nous contacter :",
        ],
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
    title: "Privacy Policy",
    lastUpdatedLabel: "Last updated",
    lastUpdated: "August 14, 2026",
    tocLabel: "Table of contents",
    intro: [
      "This Privacy Policy describes our policies and procedures on the collection, use and disclosure of your information when you use the Service, and tells you about your privacy rights and how the law protects you.",
      "We use your personal data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this Privacy Policy.",
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
            paragraphs: ["For the purposes of this Privacy Policy:"],
            bullets: [
              "Account means a unique account created for you to access our Service or parts of our Service.",
              "Affiliate means an entity that controls, is controlled by or is under common control with a party, where \"control\" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority. iTech Services SARL (itechservices.cm), Shopitech's parent company, is in particular considered an Affiliate for the purposes of this Policy.",
              "Application means the Shopitech software program provided by the Company, downloaded by you on any electronic device.",
              "Company (referred to as either \"the Company\", \"We\", \"Us\" or \"Our\" in this document) refers to Shopitech, a subsidiary of iTech Services SARL, whose registered office is located in Akwa Douche, Douala, Cameroon.",
              "Country refers to Cameroon.",
              "Device means any device that can access the Service, such as a computer, a cellphone or a digital tablet.",
              "Personal Data is any information that relates to an identified or identifiable individual.",
              "Service refers to the Shopitech Application and/or Website.",
              "Service Provider means any natural or legal person who processes the data on behalf of the Company, provides the Service on behalf of the Company, performs services related to the Service, or assists the Company in analyzing how the Service is used. This includes in particular our payment processing partner Maviance (corporate.maviance.cm), for Mobile Money and card payments, as well as our hosting and technical service providers.",
              "Usage Data refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).",
              "Website refers to Shopitech, accessible from shopitech.cm.",
              "You means the individual accessing or using the Service.",
            ],
          },
        ],
      },
      {
        id: "collecte-utilisation",
        heading: "2. Collecting and Using Your Personal Data",
        subsections: [
          {
            heading: "2.1 Personal Data we collect",
            paragraphs: [
              "While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you:",
            ],
            bullets: [
              "First and last name",
              "Email address",
              "Phone number",
              "Delivery and billing address(es) (street, city, region, location details)",
              "Your Account password (always stored in encrypted form, never in plain text)",
              "Your order history and cart content",
              "The content of support tickets or messages you send us (contact form, WhatsApp)",
              "A push notification identifier, only if you enable notifications on your device",
            ],
          },
          {
            heading: "A note on payment data",
            paragraphs: [
              "Shopitech never collects, stores or directly processes your full payment credentials (bank card number, Mobile Money PIN). This information is entered and processed exclusively on the secure interface of our payment provider, Maviance, under its own privacy policy, available on its official website corporate.maviance.cm. We only receive confirmation of whether the transaction succeeded or failed.",
            ],
          },
          {
            heading: "2.2 Usage Data",
            paragraphs: [
              "Usage Data is collected automatically when using the Service. Usage Data may include information such as your device's Internet Protocol address, browser type and version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.",
              "When you access the Service by or through a mobile device, we may collect certain information automatically, including, but not limited to, the type of mobile device you use, your mobile device unique ID, the IP address of your mobile device, your mobile operating system, the type of mobile Internet browser you use.",
            ],
          },
          {
            heading: "2.3 Tracking Technologies and Cookies",
            paragraphs: [
              "We use cookies and similar tracking technologies (web beacons, scripts, local storage identifiers) to track the activity on our Service and store certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier, sent to your browser from a website and stored on your device. Tracking technologies also used are beacons, tags and scripts to collect and track information and to improve and analyze our Service.",
              "You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some parts of our Service (for example, staying signed in or keeping your language preference).",
            ],
          },
          {
            heading: "Types of cookies we use",
            bullets: [
              "Necessary / Essential Cookies — session cookies. Administered by: Us. Purpose: these cookies are essential to provide you with services available through the Website and to enable you to use some of its features. Without these cookies, the services that you have asked for cannot be provided, and we only use these cookies to provide you with those services.",
              "Preference Cookies — persistent cookies. Administered by: Us. Purpose: these cookies allow us to remember choices you make when you use the Website, such as remembering your language preference (the shopitech-locale cookie). The purpose of these cookies is to provide you with a more personal experience and to avoid you having to re-enter your preferences every time you visit.",
              "Analytics and Advertising / Marketing Cookies — we do not currently use any third-party audience-analytics or targeted-advertising cookies (such as Google Analytics or an advertising pixel). Should we introduce any in the future, this section will be updated beforehand to inform you and, where required, to obtain your consent.",
            ],
          },
          {
            heading: "Local storage (not a cookie)",
            paragraphs: [
              "In addition to cookies, the Application uses your browser's local storage (localStorage) to keep, for the duration of your session, a secure sign-in token so that you do not have to sign in again on every visit. Unlike a cookie, this data is not automatically sent with every request and stays stored only on your device, until you sign out or clear your browsing data.",
            ],
          },
          {
            heading: "2.4 Use of your Personal Data",
            paragraphs: ["The Company may use Personal Data for the following purposes:"],
            bullets: [
              "To provide and maintain our Service, including to monitor the usage of our Service.",
              "To manage your Account: to manage your registration as a user of the Service, giving you access to the different functionalities available to registered users.",
              "For the performance of a contract: the development, compliance and undertaking of the purchase contract for the products or services you have purchased, as well as arranging their delivery.",
              "To contact you: by email, phone call, SMS, push notification, or other equivalent forms of electronic communication, regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.",
              "To provide you with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased, unless you have opted not to receive such information.",
              "To manage your requests: to attend and manage your requests to us, including support tickets you open.",
              "For business transfers: we may use your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of our assets.",
              "For other purposes: we may use your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service.",
            ],
          },
          {
            heading: "2.5 Sharing your Personal Data",
            paragraphs: ["We may share your personal information in the following situations:"],
            bullets: [
              "With Service Providers, in particular with Maviance for processing your Mobile Money (MTN Mobile Money, Orange Money) and card payments, and with our hosting providers to monitor and analyze the use of our Service.",
              "With our delivery riders, for the physical fulfillment of your orders: we only share your name, phone number and delivery address, strictly as needed for this purpose. These riders are independent contractors bound to keep this information confidential.",
              "For business transfers, in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of our business.",
              "With our Affiliates, in particular our parent company iTech Services SARL and any other subsidiary of the same group, in which case we will require those Affiliates to honor this Privacy Policy.",
              "With your consent, for any other purpose, with your prior agreement.",
            ],
          },
          {
            heading: "2.6 Retention of your Personal Data",
            paragraphs: [
              "The Company will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with tax, accounting and commercial laws applicable in Cameroon), resolve disputes, and enforce our legal agreements and policies.",
              "The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of our Service, or we are legally obligated to retain this data for longer time periods.",
              "If you delete your account, your profile (name, contact details) is anonymized. Your past order history is nonetheless retained in anonymous form, for accounting purposes and to comply with our legal obligations: it is no longer linked to your identity and is no longer accessible from a user account.",
            ],
          },
          {
            heading: "2.7 Transfer of your Personal Data",
            paragraphs: [
              "Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located, meaning that this information may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.",
              "Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer. The Company will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy, and no transfer of your Personal Data will take place to an organization or a country unless there are adequate controls in place, including the security of your data and other personal information.",
            ],
          },
        ],
      },
      {
        id: "modification-suppression",
        heading: "3. Modifying and Deleting your Personal Data",
        paragraphs: [
          "You have the right to have your information corrected, updated, or deleted.",
        ],
        bullets: [
          "You can update your profile information and manage your delivery addresses (add, edit, delete, set as default) at any time directly from the \"My Account\" section of the app.",
          "You can request the permanent deletion of your account directly from your profile, in the dedicated section. This action, preceded by a clear warning and a password confirmation step, is irreversible: it results in the anonymization of your personal data.",
          "You can also contact us at any time at contact@shopitech.cm to exercise these rights or for any question relating to your personal data.",
        ],
      },
      {
        id: "divulgation",
        heading: "4. Disclosure of your Personal Data",
        subsections: [
          {
            heading: "4.1 Business Transactions",
            paragraphs: [
              "If the Company is involved in a merger, acquisition or asset sale, your Personal Data may be transferred. We will provide notice before your Personal Data is transferred and becomes subject to a different Privacy Policy.",
            ],
          },
          {
            heading: "4.2 Law enforcement",
            paragraphs: [
              "Under certain circumstances, the Company may be required to disclose your Personal Data if required to do so by law or in response to valid requests by competent Cameroonian public authorities, in particular under Law No. 2010/012 of 21 December 2010 on cybersecurity and cybercriminality in Cameroon.",
            ],
          },
          {
            heading: "4.3 Other legal requirements",
            paragraphs: ["The Company may disclose your Personal Data in the good faith belief that such action is necessary to:"],
            bullets: [
              "Comply with a legal obligation;",
              "Protect and defend the rights or property of the Company;",
              "Prevent or investigate possible wrongdoing in connection with the Service, such as payment fraud or fraudulent use of an account;",
              "Protect the personal safety of Users of the Service or the public;",
              "Protect against legal liability.",
            ],
          },
        ],
      },
      {
        id: "securite",
        heading: "5. Security of your Personal Data",
        paragraphs: [
          "The security of your Personal Data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data — encrypted password storage, secure HTTPS connections, time-limited authentication tokens — we cannot guarantee its absolute security.",
        ],
      },
      {
        id: "protection-enfants",
        heading: "6. Children's Privacy",
        paragraphs: [
          "Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us at contact@shopitech.cm.",
          "If we become aware that we have collected Personal Data from anyone under the age of 13 without verification of parental consent, we take steps to remove that information from our servers as soon as possible.",
        ],
      },
      {
        id: "liens-externes",
        heading: "7. Links to Other Websites",
        paragraphs: [
          "Our Service may contain links to other websites that are not operated by us. This is in particular the case when you are redirected to the secure interface of our payment provider, Maviance (corporate.maviance.cm), to complete a Mobile Money or card payment, or when you follow a link to our social media pages, to our parent company iTech Services SARL (itechservices.cm), or to WhatsApp.",
          "If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.",
        ],
      },
      {
        id: "modifications-politique",
        heading: "8. Changes to this Privacy Policy",
        paragraphs: [
          "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the \"Last updated\" date at the top of this Privacy Policy.",
          "You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.",
        ],
      },
      {
        id: "contact",
        heading: "9. Contact Us",
        paragraphs: [
          "If you have any questions about this Privacy Policy or about how we handle your personal data, you can contact us:",
        ],
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
