# 🗄 Architecture de la Base de Données

Koda utilise **MongoDB** comme base de données principale, interfacée via l'ODM **Mongoose**.

## Connexion

La connexion à la base de données est gérée dans `lib/` (généralement `lib/mongodb.ts` ou `lib/db.ts`). Elle utilise un pattern de cache pour éviter de multiplier les connexions lors des rechargements à chaud en développement (Hot Reload).

## Modèles de Données

### Automation

Le modèle principal identifié est `Automation`, stocké dans le fichier `models/Automation.ts`.

| Champ | Type | Requis | Description |
| :--- | :--- | :--- | :--- |
| `title` | `String` | ✅ Oui | Titre de l'automatisation. |
| `description` | `String` | ✅ Oui | Description détaillée. |
| `price` | `Number` | ✅ Oui | Prix de vente. |
| `category` | `String` | ✅ Oui | Catégorie. Valeurs autorisées : `'n8n'`, `'Make'`, `'Zapier'`. |
| `fileUrl` | `String` | ✅ Oui | URL du fichier source hébergé sur AWS S3. |
| `previewImageUrl`| `String` | ❌ Non | URL de l'image de prévisualisation (optionnelle). |
| `sellerId` | `String` | ✅ Oui | Identifiant utilisateur Clerk du vendeur. |
| `createdAt` | `Date` | - | Date de création (Défaut : `Date.now`). |

```typescript
// Extrait du schéma Mongoose
const AutomationSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, enum: ['n8n', 'Make', 'Zapier'], required: true },
    fileUrl: { type: String, required: true }, // URL vers AWS S3
    previewImageUrl: { type: String },
    sellerId: { type: String, required: true }, // ID Clerk de l'utilisateur
    createdAt: { type: Date, default: Date.now },
});
```

## Bonnes Pratiques

- **Validation** : Mongoose assure la validation des types et des champs requis avant l'insertion.
- **Indexation** : (À définir selon les besoins de recherche) Il peut être pertinent d'indexer `category` ou `sellerId` si les recherches sur ces champs sont fréquentes.

## 🚨 Dépannage Connexion (DNS)

Si vous rencontrez des erreurs de connexion persistantes en local (`MongooseServerSelectionError` ou timeouts), votre fournisseur d'accès bloque peut-être certaines résolutions DNS.

**Solution recommandée :**
Configurez votre ordinateur pour utiliser les DNS publics de Google : `8.8.8.8` (primaire) et `8.8.4.4` (secondaire).

1. **Mac** : Réglages > Réseau > Détails > DNS.
2. **Windows** : Paramètres Réseau > IPv4 > Propriétés > DNS.
