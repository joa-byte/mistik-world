import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArtistProfileModule } from './artist-profile/artist-profile.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductImagesModule } from './product-images/product-images.module';
import { ProductsModule } from './products/products.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ArtistProfileModule,
    ProductsModule,
    ProductImagesModule,
    StorageModule,
  ],
})
export class AppModule {}
