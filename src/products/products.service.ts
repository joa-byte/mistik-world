import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { createSlug } from '../common/utils/slug.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SetCoverImageDto } from './dto/set-cover-image.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const imageSelect = {
  id: true,
  url: true,
  originalName: true,
  mimeType: true,
  size: true,
  width: true,
  height: true,
  alt: true,
  caption: true,
  createdAt: true,
  updatedAt: true,
};

const publicProductSelect = {
  id: true,
  title: true,
  slug: true,
  subtitle: true,
  description: true,
  price: true,
  sizes: true,
  featured: true,
  publishedAt: true,
  coverImage: { select: imageSelect },
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublicProducts() {
    return this.prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED },
      select: publicProductSelect,
      orderBy: [
        { featured: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findPublicProductBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: ProductStatus.PUBLISHED },
      select: {
        ...publicProductSelect,
        images: { select: imageSelect, orderBy: { createdAt: 'asc' } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  findAdminProducts() {
    return this.prisma.product.findMany({
      include: {
        coverImage: true,
        _count: { select: { images: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAdminProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        coverImage: true,
        images: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const slug = await this.resolveUniqueSlug(dto.slug ?? dto.title);

    return this.prisma.product.create({
      data: {
        title: dto.title,
        slug,
        subtitle: dto.subtitle,
        description: dto.description,
        price: dto.price,
        sizes: dto.sizes,
        status: dto.status,
        featured: dto.featured,
        publishedAt:
          dto.status === ProductStatus.PUBLISHED ? new Date() : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.ensureProductExists(id);

    let slug: string | undefined;
    if (dto.slug || dto.title) {
      slug = await this.resolveUniqueSlug(dto.slug ?? dto.title!, id);
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data: {
          title: dto.title,
          slug,
          subtitle: dto.subtitle,
          description: dto.description,
          price: dto.price,
          sizes: dto.sizes,
          status: dto.status,
          featured: dto.featured,
        },
      });
    } catch (error) {
      this.handleKnownPrismaError(error);
    }
  }

  async delete(id: string) {
    await this.ensureProductExists(id);
    await this.prisma.product.delete({ where: { id } });
    return { deleted: true };
  }

  async publish(id: string) {
    const product = await this.ensureProductExists(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        status: ProductStatus.PUBLISHED,
        publishedAt: product.publishedAt ?? new Date(),
      },
    });
  }

  async archive(id: string) {
    await this.ensureProductExists(id);

    return this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED },
    });
  }

  async setCoverImage(id: string, dto: SetCoverImageDto) {
    await this.ensureProductExists(id);
    await this.ensureImageBelongsToProduct(dto.coverImageId, id);

    return this.prisma.product.update({
      where: { id },
      data: { coverImageId: dto.coverImageId },
      include: { coverImage: true },
    });
  }

  private async ensureProductExists(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  private async ensureImageBelongsToProduct(imageId: string, productId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
      select: { id: true, productId: true },
    });

    if (!image) {
      throw new NotFoundException('Product image not found');
    }

    if (image.productId !== productId) {
      throw new BadRequestException('Cover image must belong to the product');
    }
  }

  private async resolveUniqueSlug(value: string, currentProductId?: string) {
    const slug = createSlug(value);

    if (!slug) {
      throw new BadRequestException('Slug cannot be empty');
    }

    const existing = await this.prisma.product.findUnique({ where: { slug } });

    if (existing && existing.id !== currentProductId) {
      throw new ConflictException('Product slug already exists');
    }

    return slug;
  }

  private handleKnownPrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Product slug already exists');
    }

    throw error;
  }
}
