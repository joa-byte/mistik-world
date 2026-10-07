import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SetCoverImageDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  coverImageId: string;
}
