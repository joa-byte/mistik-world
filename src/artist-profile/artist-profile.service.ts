import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateArtistProfileDto } from './dto/update-artist-profile.dto';

const publicArtistProfileSelect = {
  id: true,
  name: true,
  shortBio: true,
  bio: true,
  statement: true,
  email: true,
  instagramUrl: true,
  profileImageUrl: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class ArtistProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublic() {
    const profile = await this.prisma.artistProfile.findFirst({
      select: publicArtistProfileSelect,
    });

    if (!profile) {
      throw new NotFoundException('Artist profile not found');
    }

    return profile;
  }

  async findAdmin() {
    const profile = await this.prisma.artistProfile.findFirst();

    if (!profile) {
      throw new NotFoundException('Artist profile not found');
    }

    return profile;
  }

  async update(dto: UpdateArtistProfileDto) {
    const profile = await this.prisma.artistProfile.findFirst();

    if (!profile) {
      return this.prisma.artistProfile.create({
        data: {
          name: dto.name ?? 'Artist Name',
          ...dto,
        },
      });
    }

    return this.prisma.artistProfile.update({
      where: { id: profile.id },
      data: dto,
    });
  }
}
