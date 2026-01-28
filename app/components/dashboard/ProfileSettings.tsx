"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { User, Loader2, Save } from "lucide-react";
import { updateSellerProfile } from "@/app/actions/seller";
import { useLocalizedToast } from "@/hooks/use-localized-toast";

interface ProfileSettingsProps {
    user: any;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
    const t = useTranslations('Dashboard.profile');
    const { showSuccess, showError } = useLocalizedToast();
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            const result = await updateSellerProfile(user.clerkId, formData);

            if (result.success) {
                showSuccess('profileUpdated');
            } else {
                if (result.error === 'username_taken') {
                    showError(t('errors.usernameTaken'));
                } else {
                    showError(t('errors.updateFailed'));
                }
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Avatar Section (Read-only for now) */}
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20 border-2 border-border shadow-md">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-medium text-foreground">{t('avatar.title')}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{t('avatar.description')}</p>
                            <Button variant="outline" size="sm" disabled>
                                {t('avatar.changeButton')}
                            </Button>
                        </div>
                    </div>

                    <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">{t('form.username')}</Label>
                            <Input
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="@username"
                            />
                            <p className="text-xs text-muted-foreground">{t('form.usernameHelp')}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">{t('form.firstName')}</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">{t('form.lastName')}</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">{t('form.bio')}</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder={t('form.bioPlaceholder')}
                                className="min-h-[120px] resize-none"
                                maxLength={500}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{t('form.bioHelp')}</span>
                                <span>{formData.bio.length}/500</span>
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-end border-t border-border/50 pt-6">
                    <Button
                        type="submit"
                        form="profile-form"
                        disabled={isPending}
                        className="bg-primary hover:bg-primary/90 min-w-[120px]"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('form.saving')}
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {t('form.save')}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
