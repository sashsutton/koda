"use client";

import { useActionState } from "react"; // Hook React 19 (Next.js 15+)
import { sendFeedbackAction } from "@/app/actions/feedback";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function FeedbackForm() {
    const searchParams = useSearchParams();
    const defaultType = searchParams.get("type") || "contact"; // Récupère ?type=bug depuis l'URL

    const [state, action, isPending] = useActionState(sendFeedbackAction, { success: false });

    // Effet pour afficher les toasts
    useEffect(() => {
        if (state.success) {
            toast.success(state.message);
        } else if (state.message) {
            toast.error(state.message);
        }
    }, [state]);

    if (state.success) {
        return (
            <Card className="w-full max-w-md mx-auto text-center py-12 border-dashed">
                <CardContent className="space-y-4">
                    <div className="flex justify-center">
                        <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-500" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold">Message envoyé !</h3>
                    <p className="text-muted-foreground">
                        Merci de nous aider à améliorer Koda. Nous vous répondrons très vite.
                    </p>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        Retour
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-lg mx-auto shadow-lg border-muted/60">
            <CardHeader>
                <CardTitle>Contactez l'équipe Koda</CardTitle>
                <CardDescription>
                    Un bug ? Une suggestion ? Ou juste envie de discuter ?
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form action={action} className="space-y-6">

                    {/* Sélection du Type */}
                    <div className="space-y-2">
                        <Label>De quoi s'agit-il ?</Label>
                        <Select name="type" defaultValue={defaultType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un sujet" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bug">Signaler un bug</SelectItem>
                                <SelectItem value="feature">Suggérer une fonctionnalité</SelectItem>
                                <SelectItem value="contact">Question générale / Contact</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Votre email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="vous@exemple.com"
                            required
                        />
                        {state.errors?.email && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {state.errors.email[0]}
                            </p>
                        )}
                    </div>

                    {/* Sujet */}
                    <div className="space-y-2">
                        <Label htmlFor="subject">Sujet</Label>
                        <Input
                            id="subject"
                            name="subject"
                            placeholder="Ex: Erreur lors du paiement..."
                            required
                        />
                        {state.errors?.subject && (
                            <p className="text-sm text-destructive">{state.errors.subject[0]}</p>
                        )}
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="Dites-nous tout..."
                            className="min-h-[120px] resize-none"
                            required
                        />
                        {state.errors?.message && (
                            <p className="text-sm text-destructive">{state.errors.message[0]}</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full gap-2" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Envoi en cours...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Envoyer le message
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}