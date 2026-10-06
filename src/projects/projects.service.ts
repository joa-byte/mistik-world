import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProjectStatus } from '@prisma/client';
import { createSlug } from '../common/utils/slug.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { SetCoverImageDto } from './dto/set-cover-image.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

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

const publicProjectSelect = {
  id: true,
  title: true,
  slug: true,
  subtitle: true,
  description: true,
  year: true,
  price: true,
  sizes: true,
  featured: true,
  publishedAt: true,
  coverImage: { select: imageSelect },
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublicProjects() {
    return this.prisma.project.findMany({
      where: { status: ProjectStatus.PUBLISHED },
      select: publicProjectSelect,
      orderBy: [
        { featured: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findPublicProjectBySlug(slug: string) {
    const project = await this.prisma.project.findFirst({
      where: { slug, status: ProjectStatus.PUBLISHED },
      select: {
        ...publicProjectSelect,
        images: { select: imageSelect, orderBy: { createdAt: 'asc' } },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  findAdminProjects() {
    return this.prisma.project.findMany({
      include: {
        coverImage: true,
        _count: { select: { images: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAdminProjectById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        coverImage: true,
        images: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async create(dto: CreateProjectDto) {
    const slug = await this.resolveUniqueSlug(dto.slug ?? dto.title);

    return this.prisma.project.create({
      data: {
        title: dto.title,
        slug,
        subtitle: dto.subtitle,
        description: dto.description,
        year: dto.year,
        price: dto.price,
        sizes: dto.sizes,
        status: dto.status,
        featured: dto.featured,
        publishedAt:
          dto.status === ProjectStatus.PUBLISHED ? new Date() : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.ensureProjectExists(id);

    let slug: string | undefined;
    if (dto.slug || dto.title) {
      slug = await this.resolveUniqueSlug(dto.slug ?? dto.title!, id);
    }

    try {
      return await this.prisma.project.update({
        where: { id },
        data: {
          title: dto.title,
          slug,
          subtitle: dto.subtitle,
          description: dto.description,
          year: dto.year,
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
    await this.ensureProjectExists(id);
    await this.prisma.project.delete({ where: { id } });
    return { deleted: true };
  }

  async publish(id: string) {
    const project = await this.ensureProjectExists(id);

    return this.prisma.project.update({
      where: { id },
      data: {
        status: ProjectStatus.PUBLISHED,
        publishedAt: project.publishedAt ?? new Date(),
      },
    });
  }

  async archive(id: string) {
    await this.ensureProjectExists(id);

    return this.prisma.project.update({
      where: { id },
      data: { status: ProjectStatus.ARCHIVED },
    });
  }

  async setCoverImage(id: string, dto: SetCoverImageDto) {
    await this.ensureProjectExists(id);
    await this.ensureImageBelongsToProject(dto.coverImageId, id);

    return this.prisma.project.update({
      where: { id },
      data: { coverImageId: dto.coverImageId },
      include: { coverImage: true },
    });
  }

  private async ensureProjectExists(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  private async ensureImageBelongsToProject(imageId: string, projectId: string) {
    const image = await this.prisma.projectImage.findUnique({
      where: { id: imageId },
      select: { id: true, projectId: true },
    });

    if (!image) {
      throw new NotFoundException('Project image not found');
    }

    if (image.projectId !== projectId) {
      throw new BadRequestException('Cover image must belong to the project');
    }
  }

  private async resolveUniqueSlug(value: string, currentProjectId?: string) {
    const slug = createSlug(value);

    if (!slug) {
      throw new BadRequestException('Slug cannot be empty');
    }

    const existing = await this.prisma.project.findUnique({ where: { slug } });

    if (existing && existing.id !== currentProjectId) {
      throw new ConflictException('Project slug already exists');
    }

    return slug;
  }

  private handleKnownPrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Project slug already exists');
    }

    throw error;
  }
}
