import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// This interface defines our storage provider
interface StorageProvider {
  uploadFile(fileBuffer: Buffer, originalFilename: string, mimeType: string): Promise<string>;
}

// Local storage provider (default for Docker/Mini-PC setup)
class LocalStorageProvider implements StorageProvider {
  async uploadFile(fileBuffer: Buffer, originalFilename: string, mimeType: string): Promise<string> {
    const ext = path.extname(originalFilename) || ".jpg";
    const filename = `${uuidv4()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filepath = path.join(uploadDir, filename);

    try {
      await writeFile(filepath, fileBuffer);
    } catch (e: any) {
      if (e.code === "ENOENT") {
        await mkdir(uploadDir, { recursive: true });
        await writeFile(filepath, fileBuffer);
      } else {
        throw e;
      }
    }

    return `/uploads/${filename}`;
  }
}

// Future S3 / Vercel Blob provider can be added here
// class S3StorageProvider implements StorageProvider { ... }

// Choose provider based on environment variables
// Example: process.env.STORAGE_PROVIDER === 's3' ? new S3StorageProvider() : new LocalStorageProvider();
export const storage = new LocalStorageProvider();
