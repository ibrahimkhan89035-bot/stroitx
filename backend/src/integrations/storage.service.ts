import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

export interface UploadResult {
  storageKey: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

const portfolioUploadsDir = path.join(process.cwd(), 'uploads', 'portfolio');
if (!fs.existsSync(portfolioUploadsDir)) {
  try {
    fs.mkdirSync(portfolioUploadsDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create portfolio uploads directory:', err);
  }
}

// Multer disk storage for portfolio images
const portfolioStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, portfolioUploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const hash = crypto.randomBytes(8).toString('hex');
    const uniqueName = `portfolio_${Date.now()}_${hash}${ext}`;
    cb(null, uniqueName);
  },
});

export const portfolioUploadMiddleware = multer({
  storage: portfolioStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|avif/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    cb(null, extOk || mimeOk);
  },
}).single('portfolioImage');

export class FileStorageService {
  /**
   * Securely generates storage key and URL for uploaded files
   */
  public async uploadFile(
    fileName: string,
    mimeType: string,
    fileBuffer: Buffer
  ): Promise<UploadResult> {
    const ext = path.extname(fileName) || '.dat';
    const hash = crypto.randomBytes(16).toString('hex');
    const storageKey = `uploads/${Date.now()}_${hash}${ext}`;

    // Generate secure URL path accessible via API proxy or S3 bucket
    const fileUrl = `/api/documents/file/${storageKey}`;

    return {
      storageKey,
      fileUrl,
      fileName,
      fileType: mimeType,
      fileSize: fileBuffer.length,
    };
  }

  /**
   * Converts base64 image data string into a disk file under /uploads/portfolio/
   * and returns the relative URL to prevent PostgreSQL database bloat.
   */
  public async saveBase64Image(dataUri: string): Promise<string> {
    if (!dataUri.startsWith('data:image/')) {
      return dataUri; // Already a URL or relative path
    }

    const matches = dataUri.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return dataUri;
    }

    const extRaw = matches[1].toLowerCase();
    const ext = extRaw === 'jpeg' ? '.jpg' : `.${extRaw}`;
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const hash = crypto.randomBytes(8).toString('hex');
    const fileName = `portfolio_${Date.now()}_${hash}${ext}`;
    const filePath = path.join(portfolioUploadsDir, fileName);

    await fs.promises.writeFile(filePath, buffer);
    return `/uploads/portfolio/${fileName}`;
  }
}

export const storageService = new FileStorageService();

