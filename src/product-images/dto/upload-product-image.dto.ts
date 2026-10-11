import { ApiProperty } from '@nestjs/swagger';
import { CreateProductImageDto } from './create-product-image.dto';

export class UploadProductImageDto extends CreateProductImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file to upload.',
  })
  file: string;
}
