import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService, UploadFile } from '../storage/storage.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';

@Injectable()
export class ProductImagesService {
  private readonly logger = new Logger(ProductImagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findByProduct(productId: string) {
    await this.ensureProductExists(productId);

    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(
    productId: string,
    file: UploadFile,
    dto: CreateProductImageDto,
  ) {
    await this.ensureProductExists(productId);

    let storedFile;
    try {
      storedFile = await this.storageService.upload(file, productId);
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Failed to upload file to storage: ${error.message}`);
      throw error;
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const image = await tx.productImage.create({
          data: {
            productId,
            url: storedFile.url,
            storageKey: storedFile.storageKey,
            originalName: storedFile.originalName,
            mimeType: storedFile.mimeType,
            size: storedFile.size,
            width: storedFile.width,
            height: storedFile.height,
            alt: dto.alt,
            caption: dto.caption,
          },
        });

        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { coverImageId: true },
        });

        if (!product?.coverImageId) {
          await tx.product.update({
            where: { id: productId },
            data: { coverImageId: image.id },
          });
        }

        return image;
      });
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Database transaction failed, attempting rollback: ${error.message}`,
      );

      try {
        await this.storageService.delete(storedFile.storageKey);
        this.logger.debug(`Rolled back uploaded file: ${storedFile.storageKey}`);
      } catch (deleteErr) {
        const deleteError = deleteErr as Error;
        this.logger.error(
          `Failed to rollback file upload: ${deleteError.message}`,
        );
      }

      throw new InternalServerErrorException(
        'Failed to create product image record',
      );
    }
  }

  async update(id: string, dto: UpdateProductImageDto) {
    await this.ensureImageExists(id);

    return this.prisma.productImage.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    const image = await this.ensureImageExists(id);

    try {
      await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: image.productId },
          select: { coverImageId: true },
        });

        if (product?.coverImageId === id) {
          await tx.product.update({
            where: { id: image.productId },
            data: { coverImageId: null },
          });
        }

        await tx.productImage.delete({ where: { id } });
      });

      try {
        await this.storageService.delete(image.storageKey);
      } catch (err) {
        const error = err as Error;
        this.logger.error(
          `Failed to delete file from storage: ${error.message}`,
        );
      }

      return { deleted: true };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Failed to delete image: ${error.message}`);
      throw error;
    }
  }

  private async ensureProductExists(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  private async ensureImageExists(id: string) {
    const image = await this.prisma.productImage.findUnique({ where: { id } });

    if (!image) {
      throw new NotFoundException('Product image not found');
    }

    return image;
  }
}
