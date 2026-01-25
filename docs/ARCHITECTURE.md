# 🏗 Technical Architecture

This document provides a deep dive into the technical design and architectural choices made for the Koda project.

## 🛠 Core Technology Stack

- **Frontend / Fullstack Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
    - **React 19**: Leveraging the latest React features and optimizations.
    - **Server Components**: By default, pages and many components are rendered on the server to optimize performance and SEO.
    - **Client Components**: Used sparingly for interactive elements (forms, cart management) marked with `"use client"`.
    - **Server Actions**: Used as the primary mechanism for data mutations (POST/PUT/DELETE), providing a type-safe bridge between the frontend and backend.
- **Language**: [TypeScript](https://www.typescriptlang.org/)
    - Strict typing is enforced throughout the project to catch errors early.
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
    - Modern utility-first CSS for rapid development.
    - **Aesthetics**: Glassmorphism, subtle gradients, and custom animations ensure a premium feel.
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
    - Flexible NoSQL storage.
    - Mongoose ODM provides schema validation and advanced features like discriminators.
- **Authentication**: [Clerk](https://clerk.com/)
    - Managed authentication provider handling user registration, sessions, and security.
- **File Storage**: [AWS S3](https://aws.amazon.com/s3/)
    - Scalable object storage for product files and preview images.
- **Caching**: [Redis (via Upstash)](https://upstash.com/)
    - High-performance caching for product listings and expensive queries.

## 📂 Directory Layout

The project follows the standard Next.js App Router structure with localized features:

- `/app`: The heart of the application logic.
    - `/actions`: Business logic functions executed on the server.
    - `/api`: Standard API routes (Webhooks, File proxies).
    - `/dashboard`: Routes for the user's private space.
    - `/sell`: Routes for product submission.
- `/components`:
    - `/ui`: Reusable, atomic UI components (Buttons, Inputs, Modals).
    - `/forms`: Complex form structures and validation logic.
- `/models`: Mongoose schema definitions (The "M" in MVC).
- `/lib`: Singleton instances and shared utilities (DB connection, S3 client).
- `/hooks`: Custom React hooks for shared client-side logic.
- `/types`: Project-wide TypeScript interfaces and enums.

## 🔄 Design Patterns

### Backend-for-Frontend (BFF) via Server Actions
Instead of exposing a traditional REST API, Koda uses Server Actions. This allows:
1. **Direct DB Access**: No need to create fetch routes; actions connect directly to MongoDB.
2. **Type Safety**: The frontend knows exactly what the action expects and returns.
3. **Security**: Validation (Zod) and Auth (Clerk) are checked at the server entry point.

### Model Discriminators (Extensibility)
The `Product` model acts as a base. We use **Mongoose discriminators** to create specialized types like `Automation`. This allows the marketplace to easily add new product types (e.g., "Plugins", "Datasets") in the future without major schema migrations.

### Cache-Aside Strategy
For product listings, we use a `getOrSetCache` utility. This utility:
1. Checks Redis for the data.
2. If missing, fetches from MongoDB.
3. Saves to Redis for future requests (TTL based).
4. Automatic invalidation occurs when products are created, updated, or deleted.

## 🔒 Security Architecture

- **Path Protection**: Next.js middleware checks for active sessions on sensitive routes.
- **Action Protection**: Every Server Action verifies the user's ID via Clerk's `auth()` helper.
- **Resource Protection**: Sellers can only mutate products where `sellerId === currentUserId`.
- **Download Protection**: Download links are not stored publicly. S3 URLs are "Pre-signed," meaning they expire after 5 minutes and are only generated for users who have a confirmed `Purchase` record.
