# Gooz — Documentation API Backend

Ce document décrit l'API REST du backend Gooz (Laravel), à destination de l'équipe frontend (PWA Next.js + déploiement mobile App Store / Play Store). Il couvre l'intégration technique complète ainsi que les points à respecter impérativement pour la publication sur les stores.

Dernière mise à jour : reflète l'état réel du code au moment de la rédaction. En cas de doute, la source de vérité reste `backend/routes/api.php` et les classes `App\Http\Requests\*`.

---

## 1. Informations générales

### Base URL

```
{APP_URL}/api/v1
```

En local : `http://localhost/api/v1` (ou le port de `php artisan serve`).
**En production, `APP_URL` doit être mis à jour dans le `.env` du serveur avec le vrai domaine HTTPS** — toutes les URLs d'images uploadées sont générées à partir de cette valeur. Tant que ce n'est pas fait, les images auront une URL invalide en prod.

### CORS (appels depuis un navigateur)

Le backend n'autorise que des origines explicitement listées (`CORS_ALLOWED_ORIGINS` dans `.env` côté backend), pas `*`. En dev, `http://localhost:3000` et `http://127.0.0.1:3000` sont déjà autorisés. **Quand le domaine de production de la PWA sera connu, il faudra l'ajouter à cette variable** (`.env` backend, valeurs séparées par des virgules), sinon les appels `fetch()`/`axios` depuis le site en production échoueront silencieusement côté navigateur (l'API répond correctement, mais le navigateur bloque la lecture de la réponse par le JS — vérifiable dans la console du navigateur, pas dans les logs backend). Cette restriction ne concerne que le mode navigateur : l'app empaquetée (Capacitor/TWA) n'est pas soumise à CORS.

### Format des réponses

Toutes les réponses sont en JSON. Deux formes :

- **Ressource unique** : `{"data": {...}}` (à part `register`/`login` qui renvoient `{"user": {...}, "token": "..."}` directement, sans clé `data`).
- **Collection paginée** (listes) : format standard Laravel :

```json
{
  "data": [ ... ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": { "current_page": 1, "last_page": 3, "per_page": 15, "total": 42, ... }
}
```

- **Suppression réussie** : `204 No Content`, corps vide.

### Authentification

Authentification par **token Bearer** (Laravel Sanctum), pas par cookie de session. C'est un choix délibéré : une app empaquetée pour l'App Store/Play Store (via Capacitor/TWA) ne partage pas de cookies avec un navigateur, contrairement à un token qui fonctionne identiquement partout.

```
Authorization: Bearer {token}
```

Le token est obtenu via `/register` ou `/login`, et doit être stocké côté client (stockage sécurisé — `SecureStore`/Keychain sur mobile, pas de `localStorage` en clair si évitable) puis envoyé sur chaque route protégée.

### Codes d'erreur

| Code | Signification |
|---|---|
| `401` | Non authentifié (token absent, invalide, ou expiré) |
| `403` | Authentifié mais non autorisé (mauvais rôle, ressource appartenant à un autre utilisateur) |
| `404` | Ressource introuvable |
| `422` | Erreur de validation — voir format ci-dessous |
| `204` | Succès sans contenu (suppression, déconnexion) |

Format d'une erreur de validation (`422`) :

```json
{
  "message": "The phone field is required. (and 1 more error)",
  "errors": {
    "phone": ["The phone field is required."],
    "password": ["The password field is required."]
  }
}
```

⚠️ **Important** : les messages de validation sont actuellement en **anglais** (comportement par défaut de Laravel), à l'exception des erreurs métier que nous levons nous-mêmes explicitement en français (ex. "Ce compte a été suspendu.", "Stock insuffisant..."). Si une UI 100% française est nécessaire, il faudra soit traduire côté frontend en mappant les clés `errors`, soit publier les fichiers de langue Laravel côté backend (à discuter, pas encore fait).

### Attention aux accents dans les valeurs d'enum

Plusieurs champs (`status` de commande, `payment_method`, `delivery_status`...) utilisent des valeurs **avec accents** stockées telles quelles en base (choix du schéma initial). Il faut les envoyer et les comparer **exactement** ainsi, encodage UTF-8 :

- Statut de commande : `en_attente`, `confirmée`, `en_préparation`, `expédiée`, `livrée`, `annulée`
- Statut de livraison : `en_attente`, `pris_en_charge`, `en_transit`, `livré`, `échec`
- Moyen de paiement : `carte`, `mobile_money`, `paypal`, `espèces`

Ne pas normaliser/désaccentuer ces valeurs côté frontend avant de les renvoyer à l'API — la comparaison est stricte.

---

## 2. Authentification (`/register`, `/login`, `/me`...)

### `POST /register` — Inscription

Public. Crée un compte **client** (le rôle `admin`/`delivery` ne peut jamais être obtenu à l'inscription — c'est une protection volontaire, uniquement modifiable par un admin via l'API d'administration).

```json
// Requête
{
  "name": "Jean Dupont",
  "phone": "699123456",
  "password": "MotDePasse123!",
  "password_confirmation": "MotDePasse123!"
}
```

- `phone` : obligatoire, format `+?[0-9]{8,15}`, doit être unique.
- `password` : règles par défaut de Laravel (8 caractères minimum), doit être confirmé.

```json
// Réponse 201
{
  "user": { "id": 1, "name": "Jean Dupont", "phone": "699123456", "role": "customer", "is_active": true, "created_at": "..." },
  "token": "1|abcdef..."
}
```

### `POST /login` — Connexion

Public.

```json
// Requête
{
  "phone": "699123456",
  "password": "MotDePasse123!",
  "device_name": "iPhone de Jean"   // optionnel
}
```

`device_name` est optionnel mais **recommandé** : il permet à l'utilisateur de voir/révoquer ses sessions par appareil plus tard (ex. "déconnecter mon iPhone" sans déconnecter le web). À défaut, le `User-Agent` HTTP est utilisé.

Réponse identique à `/register` (`200` cette fois, pas `201`).

Si le compte est suspendu par un admin, la connexion échoue avec un `422` et le message `"Ce compte a été suspendu."` sur le champ `phone`.

### `POST /logout` *(auth requise)*

Révoque uniquement le token actuellement utilisé (pas les autres sessions/appareils). `204`.

### `GET /me` *(auth requise)*

Renvoie le profil de l'utilisateur connecté. Pratique pour vérifier au démarrage de l'app si le token stocké est encore valide.

### `DELETE /me` *(auth requise)* — Suppression de compte

**Obligatoire pour l'App Store** (règle Apple 5.1.1(v) : toute app permettant de créer un compte doit permettre de le supprimer depuis l'app). Doit être exposé dans les paramètres du compte côté frontend, pas seulement via un formulaire web externe.

```json
// Requête — confirmation par mot de passe obligatoire
{ "password": "MotDePasse123!" }
```

`204` en cas de succès. Le compte n'est pas vraiment effacé de la base (ses commandes passées sont conservées à des fins comptables) mais anonymisé (`nom → "Utilisateur supprimé"`, téléphone remplacé) et désactivé ; tous ses tokens sont révoqués immédiatement. **Le numéro de téléphone redevient disponible pour une nouvelle inscription.**

---

## 3. Catalogue produits

### `GET /products` — Liste (public)

Query params disponibles :

| Param | Type | Description |
|---|---|---|
| `category_id` | int | Filtre par catégorie |
| `brand_id` | int | Filtre par marque |
| `q` | string | Recherche sur `name` et `reference` (LIKE) |
| `is_promotion` | bool | `1` pour ne montrer que les produits en promo |
| `min_price` / `max_price` | number | Fourchette de prix sur `base_price` |
| `sort_by` | `created_at`\|`base_price`\|`name` | Défaut `created_at` |
| `sort_dir` | `asc`\|`desc` | Défaut `desc` |
| `per_page` | int | Défaut 15, **plafonné à 50** |

Ne renvoie que les produits `is_active = true`.

### `GET /products/{id}` — Détail (public)

404 si le produit est inactif. Renvoie aussi `variants`, `images`, `stock_quantity` (calculé : somme de `quantity_available - quantity_reserved` sur tous les entrepôts).

Le champ `price` dans la réponse est **déjà calculé** (prix promo si `is_promotion=true` et qu'un `promo_price` existe, sinon `base_price`) — ne pas refaire ce calcul côté frontend.

### `GET /categories`, `GET /categories/{id}` (public)

Catégories hiérarchiques (`parent_id` nullable, une catégorie enfant référence son parent). `GET /categories` ne renvoie que les catégories racines actives, avec leurs enfants imbriqués dans `children`.

### `GET /brands`, `GET /brands/{id}` (public)

### `GET /warehouses`, `GET /warehouses/{id}` (public)

Liste des entrepôts actifs — **utile pour construire l'écran de sélection "Retrait en boutique"** au checkout (afficher `name`, `ville`, `quartier` pour laisser le client choisir où il viendra récupérer sa commande).

### Écriture (admin uniquement, `POST/PUT/DELETE`)

Toutes les routes de mutation sur `/products`, `/categories`, `/brands`, `/variants`, `/images`, `/admin/warehouses` exigent un token dont l'utilisateur a `role = admin`. Sinon `403`.

- `POST /products/{product}/variants` — créer une variante (`size`, `color`, `material`, `additional_price`, `barcode`, `is_active`)
- `PUT /variants/{variant}`, `DELETE /variants/{variant}`
- `POST /products/{product}/images` — **upload de fichier réel**, `multipart/form-data`, champ `image` (max 4 Mo, doit être une image), + `product_variant_id` optionnel et `is_primary` booléen. Ne PAS envoyer de JSON pour cet endpoint.
- `DELETE /images/{image}`

---

## 4. Panier *(toutes les routes ci-dessous nécessitent l'authentification)*

### `GET /cart`

Récupère (ou crée automatiquement) le panier actif de l'utilisateur connecté.

```json
{
  "data": {
    "id": 12,
    "items": [
      {
        "id": 1,
        "product": { ... },
        "variant": { ... } | null,
        "quantity": 2,
        "unit_price": 15500,
        "line_total": 31000
      }
    ],
    "total": 31000
  }
}
```

### `POST /cart/items`

```json
{ "product_id": 5, "product_variant_id": 12, "quantity": 2 }
```

`product_variant_id` est optionnel (produit sans variante). Si l'article (même produit + même variante) est déjà dans le panier, la quantité **s'additionne** automatiquement — pas besoin de vérifier côté frontend avant d'appeler.

Le stock disponible est vérifié à chaque ajout : `422` avec message explicite si la quantité demandée dépasse le stock réel.

### `PUT /cart/items/{cartItem}`

```json
{ "quantity": 3 }
```

### `DELETE /cart/items/{cartItem}` et `DELETE /cart` (vide tout le panier)

---

## 5. Devis de livraison *(auth requise)*

### `POST /delivery/quote`

À appeler **avant** le checkout pour afficher le montant de la livraison au client (ex. sur l'écran de récapitulatif de commande), en fonction de sa position et de son panier actuel.

```json
// Requête
{ "latitude": 4.0800, "longitude": 9.7500 }
```

```json
// Réponse
{
  "delivery_fee": 1204,
  "distance_km": 6.69,
  "warehouse": { "id": 7, "name": "Entrepot Akwa" }
}
```

`422` si aucun entrepôt actif n'a de coordonnées enregistrées (situation anormale, à signaler).

**Comment obtenir `latitude`/`longitude` côté app** : soit via la géolocalisation native du téléphone (après demande de permission), soit via un sélecteur de carte où l'utilisateur place une épingle sur son adresse. Ce sont des coordonnées GPS réelles, pas une adresse texte — le calcul de distance ne fonctionne qu'avec ça.

La tarification (visible par le frontend uniquement à travers le montant retourné) est actuellement, pour Douala : 500 XAF de base, 2 km offerts, puis 150 XAF/km, avec un supplément au-delà de 3 articles, plafonné entre 500 et 5000 XAF. Ces valeurs sont configurables côté serveur (`.env`), donc **ne pas les coder en dur côté frontend** — toujours passer par `/delivery/quote` pour afficher un prix, et laisser le checkout recalculer le montant final côté serveur.

---

## 6. Commande (checkout) *(auth requise)*

### `POST /checkout`

Transforme le panier actif en commande. Deux modes, exclusifs, contrôlés par `delivery_method` :

**Mode `livraison`** — le colis est livré à l'adresse du client, frais calculés automatiquement :

```json
{
  "delivery_method": "livraison",
  "shipping_address": "Rue de la Joie, Bonamoussadi, Douala",
  "shipping_phone": "699123456",
  "shipping_latitude": 4.0800,
  "shipping_longitude": 9.7500,
  "payment_method": "mobile_money",
  "coupon_code": "PROMO10"
}
```

**Mode `retrait`** — le client vient chercher sa commande dans un entrepôt, **aucun frais de livraison** :

```json
{
  "delivery_method": "retrait",
  "warehouse_id": 7,
  "shipping_phone": "699123456",
  "payment_method": "espèces"
}
```

Champs communs :
- `shipping_phone` : toujours obligatoire (numéro de contact, même en cas de retrait).
- `payment_method` : `carte` | `mobile_money` | `paypal` | `espèces`. **Aucune passerelle de paiement n'est branchée pour l'instant** — ce champ enregistre l'intention de paiement, mais aucun débit réel n'a lieu. Le paiement en ligne réel sera intégré plus tard (fournisseur mobile money à confirmer).
- `coupon_code` : optionnel.

Champs conditionnels :
- Si `delivery_method = livraison` : `shipping_address`, `shipping_latitude`, `shipping_longitude` deviennent **obligatoires** (`422` sinon, avec le détail par champ).
- Si `delivery_method = retrait` : `warehouse_id` devient **obligatoire**, doit référencer un entrepôt actif existant.

`422` si le panier est vide, si le code promo est invalide/expiré/épuisé, ou si le stock est devenu insuffisant entre l'ajout au panier et le checkout (race condition gérée : la vérification est refaite et verrouillée en base au moment du checkout, pas seulement à l'ajout au panier).

En cas de succès (`200`), la commande complète est renvoyée (voir structure `OrderResource` ci-dessous), le panier est vidé (désactivé — un nouveau panier vide est automatiquement recréé au prochain ajout), et une notification push est déclenchée (voir section 9).

### `GET /orders` *(auth requise)*

Liste paginée des commandes du client connecté (uniquement les siennes).

### `GET /orders/{id}` *(auth requise)*

Détail d'une commande. `403` si elle n'appartient pas à l'utilisateur connecté (sauf si celui-ci est admin).

### Structure d'une commande (`OrderResource`)

```json
{
  "id": 5,
  "order_reference": "ORD-260712-JIIU3O",
  "status": "en_attente",
  "total_amount": 11204,
  "discount_amount": 0,
  "coupon_code": null,
  "delivery_fees": 1204,
  "delivery_method": "livraison",
  "shipping_address": "...",
  "shipping_phone": "...",
  "shipping_latitude": 4.08,
  "shipping_longitude": 9.75,
  "warehouse": { ... },
  "user": { ... },
  "items": [ { "product": {...}, "variant": {...}, "quantity": 1, "unit_price": 10000, "line_total": 10000 } ],
  "payment": { "amount": 11204, "payment_method": "carte", "payment_status": "en_attente" },
  "delivery": { "delivery_status": "en_attente", "tracking_code": "TRK-..." } | null,
  "created_at": "..."
}
```

`total_amount` inclut déjà les frais de livraison et déduit la remise — c'est le montant final à afficher/faire payer, ne pas recalculer.

---

## 7. Avis clients (reviews)

### `GET /products/{product}/reviews` (public)

Uniquement les avis **approuvés** (`is_approved = true`) — les avis en attente de modération n'apparaissent jamais publiquement.

### `POST /products/{product}/reviews` *(auth requise)*

```json
{ "rating": 5, "comment": "Très bon produit" }
```

`rating` entre 1 et 5, `comment` optionnel. **Un seul avis par client par produit** — `422` en cas de doublon. L'avis créé n'apparaît pas immédiatement dans la liste publique (passe par une modération admin d'abord) — prévoir un message du type "Votre avis a été soumis et sera visible après validation."

---

## 8. Livraison (suivi, côté livreur) *(auth requise)*

### `GET /deliveries`

Liste des livraisons **assignées à l'utilisateur connecté** (uniquement pertinent pour un compte `role = delivery`).

### `PATCH /deliveries/{id}/status`

```json
{ "delivery_status": "en_transit" }
```

Valeurs possibles : `en_attente`, `pris_en_charge`, `en_transit`, `livré`, `échec`. Autorisé uniquement pour le livreur assigné à cette livraison, ou un admin (`403` sinon). Passer à `livré` fait automatiquement passer le statut de la commande associée à `livrée` — pas besoin d'appeler `/admin/orders/{id}/status` en plus.

---

## 9. Notifications push *(auth requise)*

### `POST /device-tokens`

À appeler juste après la connexion (ou à chaque lancement de l'app si le token a pu changer), avec le token FCM/APNs obtenu du SDK natif :

```json
{ "token": "fcm-token-xxxx", "platform": "android" }
```

`platform` : `android` | `ios` | `web`.

### `DELETE /device-tokens`

À appeler à la déconnexion, avec `{ "token": "..." }`, pour arrêter de recevoir des notifications sur cet appareil après logout.

⚠️ **État actuel : le backend journalise les notifications mais ne les envoie pas encore réellement** (pas de compte Firebase/OneSignal configuré à ce jour). Toute la mécanique d'enregistrement de token et tous les points de déclenchement (commande reçue, changement de statut, livraison assignée) sont déjà en place et fonctionnels côté serveur — seul le dernier maillon (l'appel réel à FCM) manque. Le frontend peut intégrer l'enregistrement de token dès maintenant, l'envoi réel suivra sans changement d'API.

---

## 10. Codes promo

Les codes promo se **créent côté admin uniquement** (voir section 11). Côté client, un code s'utilise simplement en le passant dans `coupon_code` au checkout (section 6) — il n'y a pas d'endpoint dédié de "validation de code" séparé ; utiliser `/delivery/quote` ne vérifie pas le coupon, seul `/checkout` le fait. Si vous voulez afficher la réduction avant validation finale, il faudra soit l'ajouter côté backend (pas encore fait), soit valider uniquement au moment du checkout et permettre l'annulation/correction si le code est refusé.

---

## 11. Administration *(nécessite `role = admin`, sinon `403`)*

Toutes les routes ci-dessous sont préfixées `/admin/...` sauf indication contraire.

| Domaine | Endpoints |
|---|---|
| **Commandes** | `GET /admin/orders?status=...` (liste + filtre), `PATCH /admin/orders/{id}/status` |
| **Livraisons** | `POST /admin/orders/{id}/delivery` avec `{"delivery_boy_id": ...}` (l'utilisateur ciblé doit avoir `role = delivery`, sinon `422`) |
| **Avis** | `GET /admin/reviews` (en attente uniquement), `PATCH /admin/reviews/{id}/approve`, `DELETE /admin/reviews/{id}` |
| **Utilisateurs** | `GET /admin/users?role=...&q=...`, `GET /admin/users/{id}`, `PATCH /admin/users/{id}/role` (`customer`\|`admin`\|`delivery`), `PATCH /admin/users/{id}/suspend` (révoque aussi tous ses tokens), `PATCH /admin/users/{id}/reactivate` |
| **Entrepôts** | `GET/POST/PUT/DELETE /admin/warehouses` |
| **Codes promo** | `GET/POST/PUT/DELETE /admin/coupons` — voir champs dans `StoreCouponRequest` : `code`, `type` (`percentage`\|`fixed`), `value`, `min_order_amount`, `max_uses`, `expires_at` |
| **Statistiques** | `GET /admin/stats/overview` (CA total, nb commandes, moyenne, répartition par statut), `GET /admin/stats/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD` (CA par jour), `GET /admin/stats/top-products?limit=10` |

Un compte `admin` n'existe jamais par inscription normale — **il doit être créé en base directement ou promu via `PATCH /admin/users/{id}/role` par un admin déjà existant**. Un compte admin de démonstration existe déjà via le seeder (voir section 16) ; pour la production, il faudra créer le premier admin manuellement (`tinker` ou un seeder de prod dédié, distinct des données de démo).

---

## 12. Tableau récapitulatif de toutes les routes

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | non | Inscription |
| POST | `/login` | non | Connexion |
| POST | `/logout` | oui | Déconnexion (token courant) |
| GET | `/me` | oui | Profil courant |
| DELETE | `/me` | oui | Suppression de compte |
| GET | `/cart` | oui | Panier actif |
| POST | `/cart/items` | oui | Ajouter un article |
| PUT | `/cart/items/{id}` | oui | Modifier une quantité |
| DELETE | `/cart/items/{id}` | oui | Retirer un article |
| DELETE | `/cart` | oui | Vider le panier |
| POST | `/delivery/quote` | oui | Devis de livraison |
| POST | `/checkout` | oui | Passer commande |
| GET | `/orders` | oui | Mes commandes |
| GET | `/orders/{id}` | oui | Détail commande |
| GET | `/deliveries` | oui | Mes livraisons (livreur) |
| PATCH | `/deliveries/{id}/status` | oui | Maj statut livraison |
| POST | `/device-tokens` | oui | Enregistrer un token push |
| DELETE | `/device-tokens` | oui | Retirer un token push |
| POST | `/products/{id}/reviews` | oui | Laisser un avis |
| GET | `/products` | non | Liste produits |
| GET | `/products/{id}` | non | Détail produit |
| GET | `/products/{id}/reviews` | non | Avis approuvés d'un produit |
| GET | `/categories`, `/categories/{id}` | non | Catégories |
| GET | `/brands`, `/brands/{id}` | non | Marques |
| GET | `/warehouses`, `/warehouses/{id}` | non | Entrepôts (points de retrait) |
| POST/PUT/DELETE | `/products...`, `/variants...`, `/images...`, `/categories...`, `/brands...` | admin | Gestion catalogue |
| GET/PATCH | `/admin/orders...` | admin | Gestion commandes |
| POST | `/admin/orders/{id}/delivery` | admin | Assigner un livreur |
| GET/PATCH/DELETE | `/admin/reviews...` | admin | Modération avis |
| GET/PATCH | `/admin/users...` | admin | Gestion utilisateurs |
| GET/POST/PUT/DELETE | `/admin/warehouses...` | admin | Gestion entrepôts |
| GET/POST/PUT/DELETE | `/admin/coupons...` | admin | Gestion codes promo |
| GET | `/admin/stats/...` | admin | Statistiques |

---

## 13. Ce qui n'est PAS encore prêt côté backend (à ne pas supposer implémenté)

- **Paiement en ligne réel** : aucune passerelle Mobile Money/carte n'est branchée. `payment_method` n'enregistre qu'une intention.
- **Envoi réel des notifications push** : mécanique complète côté serveur, mais aucun envoi effectif tant que Firebase/OneSignal n'est pas configuré.
- **Traduction française des messages de validation Laravel** : actuellement en anglais par défaut.
- **Validation du code promo indépendamment du checkout** (pas d'endpoint "prévisualiser la réduction").

---

## 14. Consignes pour le déploiement App Store / Play Store

### Déjà couvert côté backend
- ✅ Suppression de compte en self-service (`DELETE /me`) — exigence Apple 5.1.1(v).
- ✅ Authentification par token (compatible app empaquetée, contrairement aux cookies de session).
- ✅ Vente de biens physiques → **pas besoin du système d'achat intégré (IAP) d'Apple/Google**, un paiement Mobile Money/carte externe est autorisé pour ce type d'app (à la différence d'une app vendant du contenu numérique consommé dans l'app).
- ✅ Pas de connexion sociale tierce (Google/Facebook) → la règle "Sign in with Apple obligatoire" ne s'applique pas. **Si un jour une connexion Google/Facebook est ajoutée, il faudra alors aussi ajouter Sign in with Apple.**

### À faire, hors backend, avant soumission
1. **HTTPS obligatoire en production** — les deux stores l'exigent, aucune exception.
2. **Politique de confidentialité** (URL publique) — obligatoire des deux côtés ; nous collectons nom, téléphone, adresse/coordonnées GPS de livraison, historique de commandes, avis, token push d'appareil.
3. **Data Safety form** (console Google Play) — formulaire déclaratif sur les données collectées, à remplir en cohérence avec la politique de confidentialité.
4. **Qualité de l'empaquetage PWA → app native** :
   - **Android** : Trusted Web Activity (TWA) est officiellement supporté par Google, généralement accepté sans difficulté.
   - **iOS** : Apple n'a pas d'équivalent officiel de TWA et applique la règle 4.2.3 qui rejette les "simples wrappers de site web sans valeur ajoutée". Il faut un empaquetage soigné (Capacitor recommandé), avec splash screen natif, navigation fluide, notifications push actives, gestion correcte du mode hors-ligne — pas un simple iframe plein écran. C'est le point le plus incertain du projet, indépendant du backend.
5. Configurer `APP_URL` en prod (voir section 1) avant de packager l'app — sinon toutes les images produits seront cassées dans l'app publiée.

---

## 15. Consignes pour une bonne PWA

Ces points concernent le frontend (Next.js), listés ici pour que rien ne soit oublié avant la mise en production :

1. **`manifest.json`** complet : `name`, `short_name`, `icons` (au moins 192×192 et 512×512, y compris un `maskable` pour Android), `start_url`, `display: "standalone"`, `theme_color`, `background_color`.
2. **Service worker** avec stratégie de cache pertinente (cache-first pour les assets statiques, network-first pour les données API type produits/commandes) — nécessaire à la fois pour l'installabilité et pour un minimum de résilience hors-ligne.
3. **HTTPS obligatoire** — un service worker ne s'enregistre pas en HTTP (sauf `localhost` en dev).
4. **Responsive réel**, pas juste "ça rentre sur mobile" — les critères d'installabilité de Chrome/Edge vérifient activement le rendu mobile.
5. **Icônes et splash screens** adaptés à la fois pour l'ajout à l'écran d'accueil PWA et pour l'empaquetage natif (Capacitor réutilise généralement les mêmes assets, mais avec des tailles supplémentaires spécifiques iOS/Android à prévoir).
6. CORS est déjà configuré côté backend (section 1) pour le dev local — ne pas oublier d'y ajouter le domaine de production dès qu'il est connu.

---

## 16. Environnement de test

`DatabaseSeeder` crée maintenant un jeu de données de démonstration complet. Pour l'obtenir sur une base fraîche :

```
php artisan migrate:fresh --seed
```

Comptes créés :

| Rôle | Téléphone | Mot de passe |
|---|---|---|
| Admin | `699000001` | `Password123!` |
| Client de test | `699000000` | `Password123!` |

⚠️ Ces identifiants sont pour le développement uniquement — **à ne jamais laisser en l'état sur un environnement de production** (changer le mot de passe admin, ou supprimer ce seeder du déploiement prod).

Données de démonstration créées :
- **5 catégories** : Vêtements (avec sous-catégories Chaussures, Sacs), Électronique, Maison & Cuisine.
- **3 marques** : Gooz Original, Douala Style, Kmer Fashion.
- **1 entrepôt** : Entrepôt Akwa, Douala (avec coordonnées GPS réelles, utilisable pour tester le calcul de livraison et le retrait en boutique).
- **6 produits** répartis sur les catégories, dont deux avec variantes (Sneakers Classic en tailles 40/41/42, Chemise Wax en couleurs Bleu/Rouge) et deux en promotion, tous avec du stock à l'entrepôt Akwa.
- **1 code promo** : `BIENVENUE10` (10 % de réduction, sans minimum ni expiration).

Testé de bout en bout : connexion admin, navigation catalogue public, ajout au panier d'une variante, checkout avec code promo appliqué (calcul de réduction vérifié).
