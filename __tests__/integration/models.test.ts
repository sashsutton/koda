import { describe, it, expect } from 'vitest';
import { Product } from '@/models/Product';
import Automation from '@/models/Automation';
import { ProductCategory } from '@/types/product';

describe('Product Model Integration', () => {
    it('should create and save an automation correctly (discriminator)', async () => {
        const automationData = {
            title: 'Test Automation Product',
            description: 'This is a test description for automation integration.',
            price: 150,
            category: ProductCategory.SOCIAL_MEDIA,
            sellerId: 'user_integration_123',
            tags: ['test', 'integration'],
            platform: 'n8n',
            fileUrl: 'https://example.com/file'
        };

        const automation = new Automation(automationData);
        const savedAutomation = await automation.save();

        expect(savedAutomation._id).toBeDefined();
        expect(savedAutomation.title).toBe(automationData.title);
        expect(savedAutomation.productType).toBe('Automation');
    });

    it('should fail validation if required fields are missing', async () => {
        const product = new Product({
            title: 'Incomplete Product'
        });

        await expect(product.save()).rejects.toThrow();
    });

    it('should fail if price is missing', async () => {
        const product = new Product({
            title: 'No Price',
            description: 'Desc',
            category: ProductCategory.DEVELOPMENT,
            sellerId: 's1'
        });

        await expect(product.save()).rejects.toThrow();
    });
});
