import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION || "us-east-1";
const bucketName = process.env.AWS_S3_BUCKET_NAME;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Extracts S3 Key from a raw key or full S3 URL.
 * @param {string} keyOrUrl 
 * @returns {string|null}
 */
export const extractS3Key = (keyOrUrl) => {
  if (!keyOrUrl || typeof keyOrUrl !== "string") return null;

  // If it's a full S3 URL (e.g. https://bucket.s3.us-east-1.amazonaws.com/folder/file.jpg)
  if (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")) {
    try {
      const urlObj = new URL(keyOrUrl);
      // Check if it belongs to our S3 bucket domain
      if (
        urlObj.hostname.includes("amazonaws.com") ||
        (bucketName && urlObj.hostname.includes(bucketName))
      ) {
        return decodeURIComponent(urlObj.pathname.replace(/^\//, ""));
      }
      // External URL (e.g. gravatar / unsplash / placeholder)
      return null;
    } catch {
      return null;
    }
  }

  // Already a relative S3 key (e.g. "avatars/123-pic.jpg")
  return keyOrUrl;
};

/**
 * Sanitizes an S3 URL or key for database storage.
 * Strips presigned query strings to ensure it fits comfortably within VARCHAR(255) (e.g. ~80 chars).
 * @param {string|null} keyOrUrl 
 * @returns {string|null}
 */
export const sanitizeMediaUrl = (keyOrUrl) => {
  if (!keyOrUrl || typeof keyOrUrl !== "string") return null;
  const key = extractS3Key(keyOrUrl);
  if (key) {
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  }
  return keyOrUrl;
};

/**
 * Generates a presigned GET URL for viewing private S3 objects.
 * If the input is already an external URL or null, returns it as-is.
 * 
 * @param {string|null} keyOrUrl - S3 Key or full S3 URL
 * @param {number} expiresIn - Expiry time in seconds (default: 24 hours / 86400s)
 * @returns {Promise<string|null>} Presigned GET URL
 */
export const getPresignedGetUrl = async (keyOrUrl, expiresIn = 86400) => {
  if (!keyOrUrl) return null;

  const key = extractS3Key(keyOrUrl);
  if (!key) {
    // If it's an external non-S3 URL, return as-is
    return keyOrUrl;
  }

  if (!bucketName) {
    return keyOrUrl;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return presignedUrl;
  } catch (error) {
    console.error(`Failed to generate presigned GET URL for key ${key}:`, error);
    return keyOrUrl;
  }
};

/**
 * Generates a presigned PUT URL for frontend direct uploads to S3.
 * 
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File MIME type
 * @param {string} folder - Folder name in S3 bucket
 * @param {number} expiresIn - Expiry in seconds (default: 300s / 5min)
 * @returns {Promise<{ uploadUrl: string, key: string, publicUrl: string }>}
 */
export const getPresignedUploadUrl = async (originalName, mimeType, folder = "uploads", expiresIn = 300) => {
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured");
  }

  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${folder}/${Date.now()}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
  const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

  return { uploadUrl, key, publicUrl };
};

/**
 * Uploads a buffer to AWS S3 and returns both the stored URL and a fresh presigned GET URL.
 * 
 * @param {Buffer} fileBuffer - The file content buffer
 * @param {string} originalName - Original name of the uploaded file
 * @param {string} mimeType - MIME type of the file (e.g., image/jpeg)
 * @param {string} folder - Folder inside S3 bucket (e.g., "avatars", "posts", "campaigns")
 * @returns {Promise<string>} Fresh presigned GET URL for immediate rendering
 */
export const uploadToS3 = async (fileBuffer, originalName, mimeType, folder = "uploads") => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
    throw new Error("AWS S3 configuration missing. Please specify AWS credentials and AWS_S3_BUCKET_NAME in .env");
  }

  // Clean filename and create unique S3 key
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${folder}/${Date.now()}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // Generate a fresh presigned GET URL for immediate rendering
  const presignedUrl = await getPresignedGetUrl(key);
  return presignedUrl;
};
