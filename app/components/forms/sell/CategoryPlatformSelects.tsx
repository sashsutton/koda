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
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
                <Label htmlFor="platform">Platform <span className="text-destructive">*</span></Label>
                <Select
                    defaultValue={platform}
                    onValueChange={(value) => onPlatformChange(value as AutomationPlatform)}
                >
                    <SelectTrigger className="h-11">
                        <SelectValue placeholder="Choose..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="n8n">n8n</SelectItem>
                        <SelectItem value="Make">Make</SelectItem>
                        <SelectItem value="Zapier">Zapier</SelectItem>
                        <SelectItem value="Python">Python</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2.5">
                <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                <Select
                    defaultValue={category}
                    onValueChange={(value) => onCategoryChange(value as ProductCategory)}
                >
                    <SelectTrigger className="h-11">
                        <SelectValue placeholder="Choose..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ProductCategory.SOCIAL_MEDIA}>Social Media</SelectItem>
                        <SelectItem value={ProductCategory.EMAIL_MARKETING}>Email Marketing</SelectItem>
                        <SelectItem value={ProductCategory.PRODUCTIVITY}>Productivity</SelectItem>
                        <SelectItem value={ProductCategory.SALES}>Sales</SelectItem>
                        <SelectItem value={ProductCategory.OTHER}>Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
