import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/upload/route';
import { NextRequest } from 'next/server';

// Mocks
vi.mock('@clerk/nextjs/server', () => ({
    auth: vi.fn().mockResolvedValue({ userId: 'test_user_id' }),
}));

vi.mock('@/lib/ratelimit', () => ({
    ratelimit: {
        limit: vi.fn().mockResolvedValue({ success: true }),
    },
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: vi.fn().mockResolvedValue('https://mock-s3-url.com/upload'),
}));

vi.mock('@aws-sdk/client-s3', () => ({
    S3Client: vi.fn(),
    PutObjectCommand: vi.fn().mockImplementation(function (config) { return config; }),
}));

// Helpers
const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
};

describe('API Route: /api/upload', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('AWS_S3_BUCKET_NAME', 'test-bucket');
        vi.stubEnv('AWS_REGION', 'us-east-1');
    });

    it('should return upload URL for valid requests', async () => {
        const body = {
            fileName: 'test.json',
            fileType: 'application/json',
            fileSize: 1024, // 1KB
        };
        const req = createRequest(body);
        const res = await POST(req);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.uploadUrl).toBe('https://mock-s3-url.com/upload');
    });

    it('should reject large files (>50MB)', async () => {
        const body = {
            fileName: 'large.json',
            fileType: 'application/json',
            fileSize: 60 * 1024 * 1024, // 60MB
        };
        const req = createRequest(body);
        const res = await POST(req);

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('size too large');
    });

    it('should handle rate limiting', async () => {
        // Mock rate limit failure
        const { ratelimit } = await import('@/lib/ratelimit');
        vi.mocked(ratelimit.limit).mockResolvedValueOnce({ success: false } as any);

        const body = {
            fileName: 'test.json',
            fileType: 'application/json',
            fileSize: 1024,
        };
        const req = createRequest(body);
        const res = await POST(req);

        expect(res.status).toBe(429);
        const data = await res.json();
        expect(data.error).toContain('Too many upload requests');
    });
});
