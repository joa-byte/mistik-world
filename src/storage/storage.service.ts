import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export type StoredFile = {
  url: string;
  storageKey: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
};

export interface UploadFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly maxFileSize: number;
  private readonly allowedMimes: string[];
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>(
      'CLOUDFLARE_R2_BUCKET_NAME',
      'default-bucket',
    );

    this.maxFileSize = this.configService.get<number>(
      'UPLOAD_MAX_SIZE',
      26214400, // 25 MB default
    );

    const allowedMimesEnv = this.configService.get<string>(
      'UPLOAD_ALLOWED_MIMES',
      'image/jpeg,image/png,image/webp,image/avif',
    );
    this.allowedMimes = allowedMimesEnv.split(',');

    const endpoint = this.configService.get<string>(
      'CLOUDFLARE_R2_ENDPOINT',
    );
    const region = this.configService.get<string>(
      'CLOUDFLARE_R2_REGION',
      'auto',
    );
    const accessKeyId = this.configService.get<string>(
      'CLOUDFLARE_R2_ACCESS_KEY_ID',
    );
    const secretAccessKey = this.configService.get<string>(
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    );

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    } as any);
  }

  async upload(
    file: UploadFile,
    projectId: string,
  ): Promise<StoredFile> {
    try {
      this.validateFile(file);

      const imageMetadata = await this.extractImageMetadata(file.buffer);
      const storageKey = this.generateStorageKey(projectId, file.originalname);

      await this.uploadToR2(file.buffer, storageKey, file.mimetype);

      const url = this.generatePublicUrl(storageKey);

      return {
        url,
        storageKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        width: imageMetadata.width,
        height: imageMetadata.height,
      };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Upload failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async delete(storageKey: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
      });
      await (this.s3Client as any).send(command);
      this.logger.debug(`Deleted file from R2: ${storageKey}`);
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Delete failed for key ${storageKey}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete file from storage');
    }
  }

  private validateFile(file: UploadFile): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    if (!this.allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimes.join(', ')}`,
      );
    }
  }

  private async extractImageMetadata(
    buffer: Buffer,
  ): Promise<{ width?: number; height?: number }> {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
      };
    } catch (err) {
      const error = err as Error;
      this.logger.warn(`Could not extract image metadata: ${error.message}`);
      return {};
    }
  }

  private generateStorageKey(projectId: string, originalName: string): string {
    const ext = originalName.split('.').pop() || 'jpg';
    const uniqueId = uuidv4();
    const timestamp = Date.now();
    return `projects/${projectId}/${timestamp}-${uniqueId}.${ext}`;
  }

  private generatePublicUrl(storageKey: string): string {
    const endpoint = this.configService.get<string>(
      'CLOUDFLARE_R2_PUBLIC_URL',
    );
    if (endpoint) {
      return `${endpoint}/${storageKey}`;
    }
    // Fallback a la URL estándar de R2
    return `https://${this.bucketName}.r2.cloudflarestorage.com/${storageKey}`;
  }

  private async uploadToR2(
    buffer: Buffer,
    storageKey: string,
    mimeType: string,
  ): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
        Body: buffer,
        ContentType: mimeType,
      });
      await (this.s3Client as any).send(command);
      this.logger.debug(`Uploaded file to R2: ${storageKey}`);
    } catch (err) {
      const error = err as Error;
      this.logger.error(`R2 upload failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to upload file to storage');
    }
  }
}
