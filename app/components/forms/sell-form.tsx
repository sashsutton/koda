"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAutomation } from "@/app/actions/automation";
import { useLocalizedToast } from "@/hooks/use-localized-toast";
import { ProductCategory } from "@/types/product";
import { AutomationPlatform } from "@/types/automation";
import { useTranslations } from "next-intl";

// Imports UI (Design)
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Loader2, Sparkles, Info } from "lucide-react";
import { Separator } from "@/app/components/ui/separator";

// Modular Components
import { PriceInput } from "./sell/PriceInput";
import { TagInput } from "./sell/TagInput";
import { CategoryPlatformSelects } from "./sell/CategoryPlatformSelects";
import { UploadZones } from "./sell/UploadZones";

export function SellForm() {
    const { showSuccess, showError, showLoading, dismiss } = useLocalizedToast();
    const t = useTranslations('Sell.form');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fileUrl, setFileUrl] = useState("");
    const [previewImageUrl, setPreviewImageUrl] = useState("");

    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        price: number;
        category: ProductCategory;
        platform: AutomationPlatform;
        tags: string[];
        version?: string;
    }>({
        title: "",
        description: "",
        price: 0,
        category: ProductCategory.PRODUCTIVITY,
        platform: "n8n",
        tags: [],
        version: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: ensure file is uploaded
        if (!fileUrl) {
            showError(t('fileRequired') || "Please upload your automation file");
            return;
        }

        setLoading(true);
        const toastId = showLoading(t('publishing'));
        try {
            const result = await createAutomation({
                ...formData,
                fileUrl,
                previewImageUrl,
                version: formData.version || undefined,
            });

            if (result.success) {
                showSuccess('productPublished');
                // Small delay to let user see success message
                setTimeout(() => {
                    router.push("/");
                }, 1000);
            }
        } catch (error: any) {
            console.error("Product creation error:", error);
            // Show user-friendly error message
            const errorMessage = error?.message || error?.toString() || "Failed to publish product";
            showError(errorMessage);
            // Don't redirect on error - let user fix the issue
        } finally {
            setLoading(false);
            dismiss(toastId);
        }
    };

    return (
        <Card className="w-full border-border/50 shadow-2xl bg-card">
            <CardHeader className="border-b border-border/50 pb-8 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-lg">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">{t('details')}</CardTitle>
                        <CardDescription className="text-base">
                            {t('detailsDesc')}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-10 pt-8">

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Titre */}
                            <div className="space-y-2.5">
                                <Label htmlFor="title" className="text-base font-medium">{t('titleRequired')} <span className="text-destructive">*</span></Label>
                                <Input
                                    id="title"
                                    placeholder={t('titlePlaceholder')}
                                    required
                                    className="h-11 text-lg"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">{t('titleHelp')}</p>
                            </div>

                            {/* Prix */}
                            <PriceInput
                                value={formData.price}
                                onChange={(val: number) => setFormData({ ...formData, price: val })}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2.5">
                            <Label htmlFor="description" className="text-base font-medium">{t('descriptionRequired')} <span className="text-destructive">*</span></Label>
                            <Textarea
                                id="description"
                                placeholder={t('descriptionPlaceholder')}
                                className="min-h-[160px] text-base leading-relaxed resize-y"
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <Separator className="bg-border/60" />

                    {/* Section 2: Catégorisation */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Info className="h-5 w-5 text-muted-foreground" />
                            {t('classification')}
                        </h3>

                        <CategoryPlatformSelects
                            platform={formData.platform}
                            category={formData.category}
                            onPlatformChange={(platform) => setFormData({ ...formData, platform })}
                            onCategoryChange={(category) => setFormData({ ...formData, category })}
                        />

                        {/* Tags & Version */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label htmlFor="version">{t('version')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                                <Input
                                    id="version"
                                    placeholder={t('versionPlaceholder')}
                                    className="h-11"
                                    value={formData.version}
                                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                />
                            </div>

                            <TagInput
                                tags={formData.tags}
                                onTagsChange={(tags) => setFormData({ ...formData, tags })}
                            />
                        </div>
                    </div>

                    <Separator className="bg-border/60" />

                    {/* Section 3: Fichiers */}
                    <UploadZones
                        previewImageUrl={previewImageUrl}
                        fileUrl={fileUrl}
                        onPreviewImageUpload={(url) => setPreviewImageUrl(url)}
                        onFileUpload={(url) => setFileUrl(url)}
                    />

                </CardContent>

                <CardFooter className="flex justify-end gap-4 border-t border-border/50 p-8 bg-muted/20 rounded-b-xl">
                    <Button variant="ghost" type="button" onClick={() => router.back()} size="lg">
                        {t('cancel')}
                    </Button>
                    <Button type="submit" size="lg" disabled={loading || !fileUrl} className="min-w-[180px] shadow-lg shadow-primary/20">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? t('publishing') : t('publish')}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}