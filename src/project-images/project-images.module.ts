import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { ProjectImagesController } from './project-images.controller';
import { ProjectImagesService } from './project-images.service';

@Module({
  imports: [StorageModule],
  controllers: [ProjectImagesController],
  providers: [ProjectImagesService],
})
export class ProjectImagesModule {}
