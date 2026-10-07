import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IdParamDto } from '../common/dto/id-param.dto';
import { ProductIdParamDto } from '../common/dto/product-id-param.dto';
import { UploadFile } from '../storage/storage.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { ProductImagesService } from './product-images.service';

@ApiTags('Product Images')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Get('admin/products/:productId/images')
  findByProduct(@Param() params: ProductIdParamDto) {
    return this.productImagesService.findByProduct(params.productId);
  }

  @Post('admin/products/:productId/images')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  create(
    @Param() params: ProductIdParamDto,
    @UploadedFile() file: UploadFile,
    @Body() dto: CreateProductImageDto,
  ) {
    return this.productImagesService.create(params.productId, file, dto);
  }

  @Patch('admin/product-images/:id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateProductImageDto) {
    return this.productImagesService.update(params.id, dto);
  }

  @Delete('admin/product-images/:id')
  delete(@Param() params: IdParamDto) {
    return this.productImagesService.delete(params.id);
  }
}
