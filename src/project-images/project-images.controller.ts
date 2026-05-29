import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IdParamDto } from '../common/dto/id-param.dto';
import { ProjectIdParamDto } from '../common/dto/project-id-param.dto';
import { CreateProjectImageDto } from './dto/create-project-image.dto';
import { UpdateProjectImageDto } from './dto/update-project-image.dto';
import { ProjectImagesService } from './project-images.service';
import { UploadFile } from '../storage/storage.service';

@ApiTags('Project Images')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ProjectImagesController {
  constructor(private readonly projectImagesService: ProjectImagesService) {}

  @Get('admin/projects/:projectId/images')
  findByProject(@Param() params: ProjectIdParamDto) {
    return this.projectImagesService.findByProject(params.projectId);
  }

  @Post('admin/projects/:projectId/images')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  create(
    @Param() params: ProjectIdParamDto,
    @UploadedFile() file: UploadFile,
    @Body() dto: CreateProjectImageDto,
  ) {
    return this.projectImagesService.create(params.projectId, file, dto);
  }

  @Patch('admin/project-images/:id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateProjectImageDto) {
    return this.projectImagesService.update(params.id, dto);
  }

  @Delete('admin/project-images/:id')
  delete(@Param() params: IdParamDto) {
    return this.projectImagesService.delete(params.id);
  }
}
