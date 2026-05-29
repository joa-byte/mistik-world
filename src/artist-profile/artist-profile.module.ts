import { Module } from '@nestjs/common';
import { ArtistProfileController } from './artist-profile.controller';
import { ArtistProfileService } from './artist-profile.service';

@Module({
  controllers: [ArtistProfileController],
  providers: [ArtistProfileService],
})
export class ArtistProfileModule {}
