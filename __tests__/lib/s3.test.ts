import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDownloadUrl, s3Client } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Mocks
vi.mock("@aws-sdk/client-s3", () => {
    class MockS3Client { }
    return {
        S3Client: MockS3Client,
        GetObjectCommand: vi.fn(),
    };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
    getSignedUrl: vi.fn(),
}));

describe("s3 utilities", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.AWS_S3_BUCKET_NAME = "test-bucket";
    });

    describe("getDownloadUrl", () => {
        it("should call getSignedUrl with correct parameters", async () => {
            const fileKey = "path/to/file.zip";
            const filename = "custom-name.zip";
            vi.mocked(getSignedUrl).mockResolvedValue("https://signed-url.com" as any);

            const result = await getDownloadUrl(fileKey, filename);

            expect(result).toBe("https://signed-url.com");
            expect(GetObjectCommand).toHaveBeenCalledWith(expect.objectContaining({
                Bucket: "test-bucket",
                Key: fileKey,
                ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`
            }));
            expect(getSignedUrl).toHaveBeenCalledWith(s3Client, expect.any(Object), { expiresIn: 300 });
        });

        it("should use default attachment disposition if no filename provided", async () => {
            const fileKey = "file.zip";
            await getDownloadUrl(fileKey);

            expect(GetObjectCommand).toHaveBeenCalledWith(expect.objectContaining({
                ResponseContentDisposition: "attachment"
            }));
        });
    });
});
