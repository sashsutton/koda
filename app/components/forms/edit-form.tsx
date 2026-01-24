"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/app/actions/product-management";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Loader2 } from "lucide-react";
import FileUpload from "@/app/components/FileUpload"; // Import du composant Upload
import { getPublicImageUrl } from "@/lib/image-helper";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getErrorKey } from "@/lib/error-translator";

interface EditFormProps {
    product: {
        _id: string;
        title: string;
        description: string;
        price: number;
        previewImageUrl?: string;
    };
}

export function EditForm({ product }: EditFormProps) {
    const tNotif = useTranslations('Notifications');
    const tErr = useTranslations('Errors');
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // On initialise avec les données existantes
    const [formData, setFormData] = useState({
        title: product.title,
        description: product.description,
        price: product.price,
        previewImageUrl: product.previewImageUrl || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Updating...");

        try {
            await updateProduct(product._id, formData);
            toast.success(tNotif('productUpdated'));
            router.push("/dashboard");
        } catch (error: any) {
            console.error(error);
            const errorKey = getErrorKey(error.message);
            toast.error(tErr(errorKey));
        } finally {
            setLoading(false);
            toast.dismiss(toastId);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Edit {product.title}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Price (€)</Label>
                        <Input
                            id="price"
                            type="number"
                            min="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Preview Image</Label>
                        <div className="border-2 border-dashed rounded-lg p-2 hover:bg-muted/50 transition-colors">
                            {!formData.previewImageUrl ? (
                                <FileUpload
                                    onUploadSuccess={(url) => setFormData({ ...formData, previewImageUrl: url })}
                                    accept="image/*"
                                    label="Change cover image"
                                />
                            ) : (
                                <div className="space-y-2">
                                    <img src={getPublicImageUrl(formData.previewImageUrl)} alt="Preview" className="w-full h-48 object-cover rounded-md" />
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        type="button"
                                        onClick={() => setFormData({ ...formData, previewImageUrl: "" })}
                                        className="w-full"
                                    >
                                        Delete / Change image
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            className="min-h-[150px]"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
