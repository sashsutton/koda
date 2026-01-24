import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

interface PriceInputProps {
    value: number;
    onChange: (value: number) => void;
}

export function PriceInput({ value, onChange }: PriceInputProps) {
    return (
        <div className="space-y-2.5">
            <Label htmlFor="price" className="text-base font-medium">Price (€) <span className="text-destructive">*</span></Label>
            <div className="relative">
                <Input
                    id="price"
                    type="number"
                    min="0"
                    placeholder="49"
                    className="pr-8 h-11 text-lg font-mono"
                    required
                    value={value || ""}
                    onChange={(e) => onChange(Number(e.target.value))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">€</span>
            </div>
            <p className="text-xs text-muted-foreground">Your net income will be calculated after commission.</p>
        </div>
    );
}
