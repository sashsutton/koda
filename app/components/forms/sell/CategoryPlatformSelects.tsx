import { Label } from "@/app/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";
import { ProductCategory } from "@/types/product";
import { AutomationPlatform } from "@/types/automation";
import { useTranslations } from "next-intl";

interface CategoryPlatformSelectsProps {
    platform: AutomationPlatform;
    category: ProductCategory;
    onPlatformChange: (value: AutomationPlatform) => void;
    onCategoryChange: (value: ProductCategory) => void;
}

export function CategoryPlatformSelects({
    platform,
    category,
    onPlatformChange,
    onCategoryChange
}: CategoryPlatformSelectsProps) {
    const t = useTranslations('Sell.form');
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
                <Label htmlFor="platform">{t('platform')} <span className="text-destructive">*</span></Label>
                <Select
                    defaultValue={platform}
                    onValueChange={(value) => onPlatformChange(value as AutomationPlatform)}
                >
                    <SelectTrigger className="h-11">
                        <SelectValue placeholder={t('choose')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="n8n">{t('platforms.n8n')}</SelectItem>
                        <SelectItem value="Make">{t('platforms.Make')}</SelectItem>
                        <SelectItem value="Zapier">{t('platforms.Zapier')}</SelectItem>
                        <SelectItem value="Python">{t('platforms.Python')}</SelectItem>
                        <SelectItem value="Other">{t('platforms.Other')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2.5">
                <Label htmlFor="category">{t('category')} <span className="text-destructive">*</span></Label>
                <Select
                    defaultValue={category}
                    onValueChange={(value) => onCategoryChange(value as ProductCategory)}
                >
                    <SelectTrigger className="h-11">
                        <SelectValue placeholder={t('choose')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ProductCategory.SOCIAL_MEDIA}>{t('categories.Social Media')}</SelectItem>
                        <SelectItem value={ProductCategory.EMAIL_MARKETING}>{t('categories.Email Marketing')}</SelectItem>
                        <SelectItem value={ProductCategory.PRODUCTIVITY}>{t('categories.Productivity')}</SelectItem>
                        <SelectItem value={ProductCategory.SALES}>{t('categories.Sales')}</SelectItem>
                        <SelectItem value={ProductCategory.OTHER}>{t('categories.Other')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
