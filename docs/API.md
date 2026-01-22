# 🔌 Documentation API (Server Actions)

Ce document référence l'ensemble des **Server Actions** disponibles dans l'application Koda.
Elles sont situées dans le dossier `/app/actions` et sont les seuls points d'entrée pour les mutations de données et les interactions avec les services tiers (Stripe, S3, MongoDB).

---

## 📂 `app/actions/automation.ts`

Gère la création des produits (automatisations).

### `createAutomation(formData: CreateAutomationInput)`
Crée un nouveau produit dans la base de données.

- **Authentification** : Requise (`userId` Clerk).
- **Prérequis** : L'utilisateur doit avoir un compte Stripe Connect configuré et validé.
- **Entrée** :
  - `title`: string
  - `description`: string
  - `price`: number
  - `category`: "n8n" | "Make" | "Zapier" | "Autre"
  - `fileUrl`: string (URL S3)
  - `previewImageUrl`: string (Optionnel)
- **Sortie** : `{ success: true, id: string }`
- **Side Effects** : Revalide la route `/`.

---

## 📂 `app/actions/product-management.ts`

Gère la modification et la suppression des produits existants.

### `updateProduct(productId: string, data)`
Met à jour les informations d'un produit.

- **Authentification** : Requise + Vérification que l'utilisateur est bien le vendeur (`sellerId`).
- **Entrée** :
  - `productId`: string
  - `data`:
    - `title`: string
    - `description`: string
    - `price`: number
    - `previewImageUrl`: string (Optionnel)
- **Sortie** : `{ success: true }`
- **Side Effects** : Revalide `/dashboard`.

### `deleteProduct(productId: string)`
Supprime définitivement un produit.

- **Authentification** : Requise + Vérification `sellerId`.
- **Entrée** : `productId` (string)
- **Sortie** : `{ success: true }`
- **Side Effects** : Revalide `/dashboard`.

---

## 📂 `app/actions/transaction.ts`

Gère le processus d'achat côté acheteur.

### `createCheckoutSession(automationId: string)`
Initialise une session de paiement Stripe Checkout.

- **Authentification** : Requise (Acheteur).
- **Logique** :
  1. Vérifie si le produit existe.
  2. Récupère le compte Stripe Connect du vendeur.
  3. Calcule les frais de plateforme (15%).
  4. Crée une session Stripe en mode `payment` avec `application_fee_amount`.
- **Entrée** : `automationId` (string)
- **Sortie** : `url` (string) - URL de redirection vers Stripe.
- **Redirection** :
  - Succès : `/success?session_id={CHECKOUT_SESSION_ID}`
  - Annulation : `/product/{id}`

---

## 📂 `app/actions/stripe-connect.ts`

Gère l'onboarding et l'accès au dashboard des vendeurs.

### `getStripeOnboardingLink()`
Génère un lien pour créer ou finaliser la configuration d'un compte Stripe Connect Express.

- **Authentification** : Requise.
- **Logique** :
  - Si l'utilisateur n'a pas de `stripeConnectId`, un compte Express est créé.
  - Génère un `accountLink` Stripe de type `account_onboarding`.
- **Sortie** : `url` (string)

### `getStripeLoginLink()`
Génère un lien de connexion unique pour accéder au dashboard Stripe Express du vendeur.

- **Authentification** : Requise.
- **Prérequis** : L'utilisateur doit avoir un `stripeConnectId` valide.
- **Sortie** : `url` (string)

---

## 📂 `app/actions/dashboard.ts`

Agrège les données pour l'affichage du Dashboard utilisateur.

### `getMyProducts()`
Récupère la liste des produits mis en vente par l'utilisateur connecté.
- **Sortie** : `Array<IAutomation>`

### `getSalesHistory()`
Récupère l'historique des ventes (items vendus).
- **Sortie** : `Array<Purchase>` (avec `productId` peuplé).

### `getMyOrders()`
Récupère l'historique des achats (items achetés).
- **Sortie** : `Array<Purchase>` (avec `productId` peuplé).

### `getSellerBalance()`
Récupère la balance financière directement depuis l'API Stripe.
- **Sortie** :
  - `available`: number (Montant disponible pour virement)
  - `pending`: number (Montant en cours de traitement)
  - `currency`: string (ex: "EUR")
