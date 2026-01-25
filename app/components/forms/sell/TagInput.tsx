import { useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface TagInputProps {
    tags: string[];
    onTagsChange: (tags: string[]) => void;
}

export function TagInput({ tags, onTagsChange }: TagInputProps) {
    const t = useTranslations('Sell.form');
    const [tagInput, setTagInput] = useState("");

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            onTagsChange([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onTagsChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="space-y-2.5">
            <Label htmlFor="tags">Tags <span className="text-muted-foreground font-normal">{t('tagsHelp')}</span></Label>
            <div className="flex gap-2">
                <Input
                    id="tags"
                    placeholder={t('tagsPlaceholder')}
                    value={tagInput}
                    className="h-11"
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                        }
                    }}
                />
                <Button type="button" onClick={handleAddTag} variant="secondary" className="h-11 px-4">
                    {t('add')}
                </Button>
            </div>
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-muted/40 rounded-lg border border-border/50">
                    {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="pl-2.5 pr-1 py-1 text-sm">
                            {tag}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-2 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveTag(tag)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
