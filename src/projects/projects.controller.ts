import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IdParamDto } from '../common/dto/id-param.dto';
import { SlugParamDto } from '../common/dto/slug-param.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { SetCoverImageDto } from './dto/set-cover-image.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('public/projects')
  @ApiOkResponse({ description: 'Published projects with cover image.' })
  findPublicProjects() {
    return this.projectsService.findPublicProjects();
  }

  @Get('public/projects/:slug')
  @ApiOkResponse({ description: 'Published project detail by slug.' })
  findPublicProject(@Param() params: SlugParamDto) {
    return this.projectsService.findPublicProjectBySlug(params.slug);
  }

  @Get('admin/projects')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminProjects() {
    return this.projectsService.findAdminProjects();
  }

  @Get('admin/projects/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminProject(@Param() params: IdParamDto) {
    return this.projectsService.findAdminProjectById(params.id);
  }

  @Post('admin/projects')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Patch('admin/projects/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param() params: IdParamDto, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(params.id, dto);
  }

  @Delete('admin/projects/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  delete(@Param() params: IdParamDto) {
    return this.projectsService.delete(params.id);
  }

  @Patch('admin/projects/:id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  publish(@Param() params: IdParamDto) {
    return this.projectsService.publish(params.id);
  }

  @Patch('admin/projects/:id/archive')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  archive(@Param() params: IdParamDto) {
    return this.projectsService.archive(params.id);
  }

  @Patch('admin/projects/:id/cover-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  setCoverImage(@Param() params: IdParamDto, @Body() dto: SetCoverImageDto) {
    return this.projectsService.setCoverImage(params.id, dto);
  }
}
