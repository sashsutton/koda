# 🏗 Architecture du Projet Koda

Ce document décrit l'architecture technique du projet Koda.

## 🛠 Stack Technique

- **Frontend / Fullstack Framework** : [Next.js 16 (App Router)](https://nextjs.org/)
  - Utilisation de React 19 pour les composants.
  - Architecture basée sur les Server Components (par défaut) et Client Components (`"use client"`).
- **Langage** : TypeScript
- **Styling** : [Tailwind CSS 4](https://tailwindcss.com/)
  - Utilisation de `clsx` et `tailwind-merge` pour la gestion conditionnelle des classes.
  - Composants UI basés sur Radix UI (accessibilité).
- **Base de Données** : MongoDB (via [Mongoose](https://mongoosejs.com/))
- **Authentification** : [Clerk](https://clerk.com/)
- **Stockage de Fichiers** : [AWS S3](https://aws.amazon.com/s3/)

## 📂 Structure des Dossiers

L'application suit la structure recommandée par le **Next.js App Router** :

- **/app** : Contient les routes de l'application. Chaque dossier correspond à un segment d'URL (ex: `/app/dashboard` -> `/dashboard`).
  - `page.tsx` : UI de la route.
  - `layout.tsx` : Layout partagé (Header, Sidebar, etc.).
  - `actions.ts` (ou dossiers `/actions`) : Server Actions pour les mutations de données (Backend-for-Frontend).
- **/components** : Composants React réutilisables (Boutons, Cartes, Modales).
- **/lib** : Code utilitaire partagé.
  - Connexion BDD (`db.ts` ou similaire).
  - Configuration S3.
  - Fonctions helpers.
- **/models** : Définitions des schémas Mongoose (ODM).
- **/types** : Définitions de types TypeScript globaux.

## 🔄 Flux de Données (Vue d'ensemble)

1. **Client** : L'utilisateur interagit avec l'interface (Formulaire, Bouton).
2. **Server Action** : Une fonction asynchrone exécutée côté serveur est appelée.
3. **Logic** : Validation des données, authentification (via Clerk), logique métier.
4. **Database / External Service** :
   - Lecture/Écriture dans MongoDB.
   - Upload/Download depuis AWS S3.
5. **Response** : Mise à jour de l'UI (via revalidation ou retour direct de l'action).
