import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArtistProfileModule } from './artist-profile/artist-profile.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectImagesModule } from './project-images/project-images.module';
import { ProjectsModule } from './projects/projects.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ArtistProfileModule,
    ProjectsModule,
    ProjectImagesModule,
    StorageModule,
  ],
})
export class AppModule {}
