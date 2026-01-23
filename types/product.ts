export enum ProductCategory {
    SOCIAL_MEDIA = 'Social Media',
    EMAIL_MARKETING = 'Email Marketing',
    PRODUCTIVITY = 'Productivity',
    SALES = 'Sales',
    OTHER = 'Other'
}

export interface IProduct {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: ProductCategory;
    tags: string[];
    previewImageUrl?: string;
    sellerId: string;
    createdAt: Date;
    seller?: {
        username?: string;
        firstName?: string;
        lastName?: string;
        imageUrl?: string;
    };
}