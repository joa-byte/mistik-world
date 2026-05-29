import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ArtistProfileService } from './artist-profile.service';
import { UpdateArtistProfileDto } from './dto/update-artist-profile.dto';

@ApiTags('Artist Profile')
@Controller()
export class ArtistProfileController {
  constructor(private readonly artistProfileService: ArtistProfileService) {}

  @Get('public/artist-profile')
  @ApiOkResponse({ description: 'Public artist profile.' })
  findPublic() {
    return this.artistProfileService.findPublic();
  }

  @Get('admin/artist-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdmin() {
    return this.artistProfileService.findAdmin();
  }

  @Patch('admin/artist-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Body() dto: UpdateArtistProfileDto) {
    return this.artistProfileService.update(dto);
  }
}
