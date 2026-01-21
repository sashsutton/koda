import { connectToDatabase } from "@/lib/db";
import Automation from "@/models/Automation";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { CheckCircle2, Download, Home, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Stripe from "stripe";
import { notFound, redirect } from "next/navigation";
import { getDownloadUrl } from "@/lib/s3"; // Import de la fonction sécurisée

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface SuccessPageProps {
    searchParams: Promise<{ session_id: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
    const { session_id } = await searchParams;

    // Si pas d'ID de session, on redirige vers l'accueil
    if (!session_id) {
        redirect("/");
    }

    let session;
    try {
        session = await stripe.checkout.sessions.retrieve(session_id);
    } catch (error) {
        console.error("Erreur Stripe:", error);
        notFound();
    }

    const productId = session.metadata?.productId;
    if (!productId) notFound();

    await connectToDatabase();
    const product = await Automation.findById(productId).lean();

    if (!product) notFound();

    // Génération du lien de téléchargement sécurisé (S3 Presigned URL)
    // On extrait la clé S3 de l'URL complète stockée en base
    let secureDownloadUrl = "#";
    try {
        const fileKey = product.fileUrl.split('.com/')[1];
        secureDownloadUrl = await getDownloadUrl(fileKey);
    } catch (error) {
        console.error("Erreur lors de la génération du lien S3:", error);
    }

    return (
        <div className="min-h-[80-screen] flex items-center justify-center p-4 py-20">
            <Card className="max-w-xl w-full border-border/50 shadow-2xl bg-card/50 backdrop-blur">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 animate-pulse"></div>
                            <CheckCircle2 className="h-20 w-20 text-green-500 relative" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-extrabold tracking-tight">
                        Paiement Confirmé !
                    </CardTitle>
                    <p className="text-muted-foreground mt-2">
                        Merci pour votre confiance. Votre automatisation est prête.
                    </p>
                </CardHeader>

                <CardContent className="space-y-8 pt-6">
                    {/* Détails du produit acheté */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Produit</span>
                            <span className="font-semibold">{product.title}</span>
                        </div>
                        <div className="text-right flex flex-col">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Prix</span>
                            <span className="font-bold text-primary">{product.price} €</span>
                        </div>
                    </div>

                    {/* Zone de téléchargement */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium justify-center">
                            <ShieldCheck className="h-4 w-4" />
                            Lien de téléchargement sécurisé généré
                        </div>

                        <Button asChild size="lg" className="w-full h-16 text-lg shadow-xl shadow-primary/10">
                            <a href={secureDownloadUrl} download={`${product.title}.json`}>
                                <Download className="mr-3 h-6 w-6" />
                                Télécharger le fichier .JSON
                            </a>
                        </Button>

                        <p className="text-[11px] text-center text-muted-foreground italic">
                            Ce lien est temporaire et expirera dans 5 minutes par mesure de sécurité.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Accueil
                            </Link>
                        </Button>
                        <Button variant="ghost" asChild className="w-full">
                            <Link href="/dashboard" className="flex items-center">
                                Mes achats
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}