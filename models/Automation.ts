import { Schema } from 'mongoose';
import { Product } from './Product';
import { AutomationPlatform } from '@/types/automation';

// Check if discriminator already exists to avoid "already exists" error
// This happens because the module can be imported multiple times
const Automation = Product.discriminators?.Automation || Product.discriminator('Automation', new Schema({
    platform: {
        type: String,
        required: true,
        enum: ['n8n', 'Make', 'Zapier', 'Python', 'Other'] as AutomationPlatform[]
    },
    fileUrl: { type: String, required: true },
    version: { type: String }
}));

export default Automation;