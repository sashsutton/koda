/**
 * Transforme une URL S3 en URL publique pour l'affichage.
 * Maintenant que Next.js Image est configuré pour S3, on retourne directement l'URL.
 * @param s3Url L'URL complète stockée en base (ex: https://bucket.s3...)
 * @returns L'URL S3 ou une image par défaut
 */
export function getPublicImageUrl(s3Url?: string | null) {
    if (!s3Url) return "/placeholder-image.jpg";
    // Retourne directement l'URL S3 - Next.js Image gérera l'optimisation
    return s3Url;
}
