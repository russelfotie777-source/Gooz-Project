# SEO — ce qu'il reste à faire

Ce document complète le travail déjà fait (voir le commit correspondant : sitemap, robots.txt, llms.txt, métadonnées par page, données structurées JSON-LD, URLs produit avec slug). La base technique est terminée ; ce qui suit dépend soit de contenu qui n'existe pas encore, soit d'actions à faire en dehors du code.

## 1. Dès qu'il y a de vrais avis clients

Le système d'avis existe déjà en base de données (note + commentaire par produit), mais il est vide aujourd'hui — **zéro avis**.

Dès qu'il y a de vrais avis approuvés sur au moins quelques produits :
- Ajouter le schéma `AggregateRating` (note moyenne + nombre d'avis) sur les fiches produit — c'est ce qui fait apparaître les étoiles ⭐ dans les résultats Google et que lisent les IA shopping.
- Ne surtout pas l'ajouter avant d'avoir de vrais avis : Google sanctionne les données structurées avec une note fabriquée ou vide.

## 2. Dès que les vrais réseaux sociaux existent

Les icônes Facebook/Instagram/TikTok du footer pointent aujourd'hui vers `#` (aucune vraie page).

Dès que les comptes réseaux sociaux de Shopitech/iTech Services sont créés :
- Mettre les vraies URLs dans le footer.
- Les ajouter aussi au schéma `Organization` (`sameAs`) — ça aide Google et les IA à confirmer que c'est bien la même entreprise sur plusieurs plateformes, et ça renforce la fiche d'identité de la marque.

## 3. Actions à faire hors du code (par toi, pas par moi)

- **Soumettre le site à Google Search Console** et à **Bing Webmaster Tools**, en donnant l'URL du sitemap : `https://[ton-domaine]/sitemap.xml`. Sans ça, même un site parfaitement optimisé met beaucoup plus de temps à être découvert.
- **Obtenir des liens entrants** (d'autres sites qui parlent de Shopitech, annuaires d'entreprises camerounaises, partenaires, presse) — c'est un des facteurs de classement les plus lourds, et aucun code n'y change quoi que ce soit.
- **Créer/vérifier une fiche Google Business Profile** si Shopitech a un point de vente physique ou un service client localisé — utile pour le référencement local.
- **Enrichir le contenu produit dans le temps** : plus une fiche produit a une description détaillée et unique (pas juste le nom répété), mieux elle se positionne. Une description vide ou trop courte utilise aujourd'hui un texte générique de secours — correct mais moins efficace qu'une vraie description écrite pour chaque produit.

## 4. Volontairement mis de côté (pas urgent aujourd'hui)

- **Pagination et filtres du catalogue non reflétés dans l'URL** : aujourd'hui, changer de page ou filtrer dans le catalogue ne change pas l'adresse affichée dans le navigateur (tout se passe en JavaScript côté client). Conséquence : Google et les IA ne voient que la toute première page de chaque catégorie/catalogue, jamais la suite. Sans impact tant que le catalogue reste petit (une catégorie avec moins de 9-10 produits tient sur une seule page), mais si le catalogue grossit beaucoup, ça vaudra le coup de revoir ça — c'est un changement d'architecture (pas une correction rapide), donc à traiter comme un chantier à part le moment venu.

## Pense-bête : à ne pas oublier au déploiement

- Définir la variable d'environnement `NEXT_PUBLIC_SITE_URL` avec le vrai nom de domaine (aujourd'hui elle n'est pas définie en local et retombe sur `localhost:3000`). Sans ça, le sitemap, le canonical et les images de partage pointeront vers la mauvaise adresse une fois en ligne.
