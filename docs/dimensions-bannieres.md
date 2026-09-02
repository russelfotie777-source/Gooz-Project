# Dimensions des bannières — Gooz / Shopitech

Document de référence pour le graphiste : chaque bannière présente dans le code du site, avec les dimensions à utiliser pour les créations mobile et desktop.

Sauf mention contraire, les coins arrondis sont appliqués automatiquement par le site (pas besoin de les inclure dans le visuel), et le format recommandé est JPG pour une photo, PNG si le visuel a du texte fin ou de la transparence. Poids conseillé : sous les 300 Ko par image pour ne pas ralentir le chargement.

---

## 1. Bannière héro — page d'accueil

- **Où** : tout en haut de la page d'accueil, juste sous le header. Gérée depuis le panel admin (menu Bannières, emplacement `homepage`). Plusieurs bannières actives défilent automatiquement en carrousel.
- **Comportement** : l'image remplit tout le cadre en étant **recadrée** (`cover`) — elle n'est jamais déformée, mais ses bords (surtout en haut/bas) peuvent être coupés selon la largeur d'écran du visiteur. Garder les éléments importants centrés, pas collés aux bords.
- **Zone de texte** : le titre, la description et le bouton du site s'affichent **par-dessus** l'image, sur la partie gauche, avec un voile sombre en dégradé (foncé à gauche → transparent à droite). Cette zone gauche fait **65 % de la largeur sur mobile** et **55 % sur desktop**. → Placer le sujet principal du visuel (produit, visage, logo) plutôt **du côté droit** de l'image, et éviter du texte important à gauche puisqu'il sera assombri et potentiellement recouvert.

| | Largeur | Hauteur minimum | Ratio indicatif |
|---|---|---|---|
| **Mobile** | pleine largeur de l'écran (environ 360 px de large en moyenne) | 170 px | ≈ 2:1 |
| **Desktop** | pleine largeur de la colonne centrale (variable selon l'écran) | 220 px | ≈ 7:1 |

**Dimension recommandée à fournir : 1600 × 220 px** (le serveur redimensionne automatiquement tout upload plus large à 1600 px de large maximum — inutile de fournir plus grand). Cette même image sert de base recadrée pour le mobile, donc la composition doit rester lisible aussi bien en format large (desktop) qu'en format plus carré (mobile, ≈ 2:1).

---

## 2. Bannière héro — page catégorie

- **Où** : même emplacement visuel qu'en page d'accueil (même composant), mais en haut des pages catégorie. Gérée depuis le panel admin, emplacement `category`.
- **Dimensions et comportement** : **identiques au point 1** (mêmes règles de recadrage, même zone de texte à gauche).

**Dimension recommandée : 1600 × 220 px**, mêmes consignes que la bannière d'accueil.

---

## 3. Bannières publicitaires colonne (desktop uniquement)

- **Où** : à droite du carrousel héro (page d'accueil et page catégorie), **visible uniquement sur grand écran** (à partir de 1024 px de large). Deux emplacements empilés verticalement.
- **Statut actuel** : emplacement prévu dans la mise en page mais **pas encore relié à une image** dans le panel admin — ces dimensions sont données à titre préparatoire, pas urgent.
- **Comportement** : pas de recadrage particulier documenté, l'espace est de taille fixe.

| | Largeur | Hauteur (chacune) |
|---|---|---|
| **Desktop (1024–1279 px d'écran)** | 220 px | ≈ 104 px |
| **Desktop large (≥ 1280 px d'écran)** | 260 px | ≈ 104 px |

**Dimension recommandée : 260 × 104 px** (fonctionne aussi en 220 px de large, juste un peu d'espace vide sur les côtés).

---

## 4. Bandeau publicitaire du header

- **Où** : bande fine sous le header, tout en haut de chaque page (avant le contenu). Desktop et mobile.
- **Statut actuel** : emplacement réservé mais **vide, pas encore relié à une image** — dimensions données à titre préparatoire.

| | Largeur | Hauteur |
|---|---|---|
| **Mobile** | largeur de l'écran − 24 px (marge de 12 px de chaque côté) | 50 px |
| **Desktop** | pleine largeur | 56 px |

**Dimension recommandée : mobile 400 × 50 px / desktop 1600 × 56 px.**

---

## 5. Bannière publicitaire — page produit (desktop uniquement)

- **Où** : sur la fiche produit, visible uniquement sur desktop (à partir de 1024 px). Image statique du site (pas gérée depuis l'admin).
- **Fichier actuel** : `ad-banner.jpg`, 1000 × 183 px.
- **Comportement** : pleine largeur de son emplacement, hauteur automatique — l'image entière est **toujours visible en entier**, sans recadrage (contrairement aux bannières héro).

**Dimension recommandée pour un remplacement : garder le ratio ≈ 5,5:1, par exemple 1600 × 293 px.**

---

## 6. Bannière promo "CAMON Slim"

- **Où** : page d'accueil et page catégorie, sous le carrousel héro. Image statique du site (pas gérée depuis l'admin), **la même image sert pour mobile et desktop** (pas de version séparée).
- **Fichier actuel** : `camon-banner.png`, 1408 × 126 px.
- **Comportement** : pleine largeur, hauteur automatique — pas de recadrage, une seule version suffit pour les deux formats.

**Dimension recommandée pour un remplacement : garder le ratio ≈ 11,2:1, par exemple 1600 × 143 px.**

---

## Remarque

Le système de bannières du panel admin prévoit aussi deux emplacements supplémentaires (`search` et `checkout`), mais **aucune page du site ne les affiche actuellement** — inutile de préparer des visuels pour ceux-là pour le moment.
