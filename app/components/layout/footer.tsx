import { Link } from '@/i18n/routing'; // On utilise le lien i18n
import { Separator } from "@/app/components/ui/separator";
import { Mail, Bug } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-muted/30 border-t mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Colonne 1 : Brand */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg tracking-tight">Koda.</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            La marketplace de confiance pour automatiser votre business avec n8n, Make et Zapier etc...
                        </p>
                    </div>

                    {/* Colonne 2 : Marketplace */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wider">Marketplace</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/catalog" className="hover:text-primary transition-colors">Catalogue</Link></li>
                            <li><Link href="/sell" className="hover:text-primary transition-colors">Vendre un workflow</Link></li>
                            <li><Link href="/dashboard" className="hover:text-primary transition-colors">Mon compte</Link></li>
                        </ul>
                    </div>

                    {/* Colonne 3 : Légal */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wider">Légal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Conditions Générales</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Confidentialité</Link></li>
                            <li><Link href="/legal" className="hover:text-primary transition-colors">Mentions Légales</Link></li>
                        </ul>
                    </div>

                    {/* Colonne 4 : Support & Bugs */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wider">Support</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">

                            {/* Lien Contact vers la page */}
                            <li>
                                <Link
                                    href="/feedback?type=contact"
                                    className="hover:text-primary transition-colors flex items-center gap-2"
                                >
                                    <Mail className="h-4 w-4" />
                                    Nous contacter
                                </Link>
                            </li>

                            {/* Lien Bug vers la page */}
                            <li>
                                <Link
                                    href="/feedback?type=bug"
                                    className="hover:text-destructive transition-colors flex items-center gap-2"
                                >
                                    <Bug className="h-4 w-4" />
                                    Signaler un bug
                                </Link>
                            </li>

                            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                        </ul>
                    </div>
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
                    <p>© {currentYear} Koda. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
}