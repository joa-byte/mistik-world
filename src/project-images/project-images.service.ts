import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService, UploadFile } from '../storage/storage.service';
import { CreateProjectImageDto } from './dto/create-project-image.dto';
import { UpdateProjectImageDto } from './dto/update-project-image.dto';

@Injectable()
export class ProjectImagesService {
  private readonly logger = new Logger(ProjectImagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findByProject(projectId: string) {
    await this.ensureProjectExists(projectId);

    return this.prisma.projectImage.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(
    projectId: string,
    file: UploadFile,
    dto: CreateProjectImageDto,
  ) {
    await this.ensureProjectExists(projectId);

    let storedFile;
    try {
      storedFile = await this.storageService.upload(file, projectId);
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Failed to upload file to storage: ${error.message}`);
      throw error;
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const image = await tx.projectImage.create({
          data: {
            projectId,
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

        const project = await tx.project.findUnique({
          where: { id: projectId },
          select: { coverImageId: true },
        });

        if (!project?.coverImageId) {
          await tx.project.update({
            where: { id: projectId },
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
      // Rollback: eliminar archivo del storage si la BD falla
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
        'Failed to create project image record',
      );
    }
  }

  async update(id: string, dto: UpdateProjectImageDto) {
    await this.ensureImageExists(id);

    return this.prisma.projectImage.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    const image = await this.ensureImageExists(id);

    try {
      await this.prisma.$transaction(async (tx) => {
        const project = await tx.project.findUnique({
          where: { id: image.projectId },
          select: { coverImageId: true },
        });

        if (project?.coverImageId === id) {
          await tx.project.update({
            where: { id: image.projectId },
            data: { coverImageId: null },
          });
        }

        await tx.projectImage.delete({ where: { id } });
      });

      // Eliminar del storage después de que la BD confirme
      try {
        await this.storageService.delete(image.storageKey);
      } catch (err) {
        const error = err as Error;
        this.logger.error(
          `Failed to delete file from storage: ${error.message}`,
        );
        // No lanzar error aquí, la imagen ya fue eliminada de la BD
      }

      return { deleted: true };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Failed to delete image: ${error.message}`);
      throw error;
    }
  }

  private async ensureProjectExists(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }

  private async ensureImageExists(id: string) {
    const image = await this.prisma.projectImage.findUnique({ where: { id } });

    if (!image) {
      throw new NotFoundException('Project image not found');
    }

    return image;
  }
}
