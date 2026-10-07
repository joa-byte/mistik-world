import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IdParamDto } from '../common/dto/id-param.dto';
import { SlugParamDto } from '../common/dto/slug-param.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { SetCoverImageDto } from './dto/set-cover-image.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('public/products')
  @ApiOkResponse({ description: 'Published products with cover image.' })
  findPublicProducts() {
    return this.productsService.findPublicProducts();
  }

  @Get('public/products/:slug')
  @ApiOkResponse({ description: 'Published product detail by slug.' })
  findPublicProduct(@Param() params: SlugParamDto) {
    return this.productsService.findPublicProductBySlug(params.slug);
  }

  @Get('admin/products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminProducts() {
    return this.productsService.findAdminProducts();
  }

  @Get('admin/products/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminProduct(@Param() params: IdParamDto) {
    return this.productsService.findAdminProductById(params.id);
  }

  @Post('admin/products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch('admin/products/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param() params: IdParamDto, @Body() dto: UpdateProductDto) {
    return this.productsService.update(params.id, dto);
  }

  @Delete('admin/products/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  delete(@Param() params: IdParamDto) {
    return this.productsService.delete(params.id);
  }

  @Patch('admin/products/:id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  publish(@Param() params: IdParamDto) {
    return this.productsService.publish(params.id);
  }

  @Patch('admin/products/:id/archive')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  archive(@Param() params: IdParamDto) {
    return this.productsService.archive(params.id);
  }

  @Patch('admin/products/:id/cover-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  setCoverImage(@Param() params: IdParamDto, @Body() dto: SetCoverImageDto) {
    return this.productsService.setCoverImage(params.id, dto);
  }
}
