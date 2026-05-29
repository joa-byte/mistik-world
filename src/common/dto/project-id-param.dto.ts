import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ProjectIdParamDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  projectId: string;
}
