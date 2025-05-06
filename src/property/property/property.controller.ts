import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto, GetPropertyDto } from './property.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { RolesGuard } from 'src/auth/roles.guard';
import {
  DiscountContains,
  DiscountRules,
  PricingTypes,
} from 'src/schemas/property.schema';

@Controller('property')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly propertyTypesService: PropertyService,
  ) {}

  @Get('wishlist/add')
  @UseGuards(RolesGuard)
  @Roles(Role.User)
  async addToWishlist(
    @Query('propertyId') propertyId: string,
    @Req() req:any
  ){
    const result = await this.propertyService.addProductInWishList(req.user._id, propertyId);
    return { message: 'Added to wishlist', result, success: true };
  }

  @Get('wishlist')
  @UseGuards(RolesGuard)
  @Roles(Role.User)
  async getWishlist(
    @Req() req: any,
  ) {
    return this.propertyService.getWishList(
      req.user._id,
    );
  }

  @Get('wishlist/remove')
  @UseGuards(RolesGuard)
  @Roles(Role.User)
  async removeFromWishlist(
    @Query('propertyId') propertyId: string,
    @Req() req: any,
  ) {
    const result = await this.propertyService.deleteFromWishList(
      req.user._id,
      propertyId,
    );
    return { message: 'Removed from wishlist', result, success: true };
  }

  @Get('wishlist/property')
  @UseGuards(RolesGuard)
  @Roles(Role.User)
  async getWishlistProperty(
    @Query('propertyId') propertyId: string,
    @Req() req: any,
  ) {
    return this.propertyService.getWishlistProperty(
      req.user._id,
      propertyId,
    );
  }
  
  @Get('wishlist/properties')
  @UseGuards(RolesGuard)
  @Roles(Role.User)
  async getWishlistProperties(
    @Req() req: any,
  ){
    return this.propertyService.getWishlistIds(req.user._id);
  }

  @Get('property-pricing-types')
  getPropertyPricingTypes() {
    // i want o
    return Object.entries(PricingTypes);
    // .map(([key, value]) => ({ key: key, value: value }))
  }

  @Get('property-discount-contains')
  getPropertyDiscountCOntains() {
    return Object.entries(DiscountContains).filter(([key, value]) => {
      return key !== 'NORMAL';
    });
  }

  @Get('property-types')
  async getPropertyTypes() {
    return this.propertyTypesService.getPropertyTypes();
  }

  @Get('cities')
  async getCities() {
    return this.propertyService.getCities();
  }

  @Get('my-properties')
  @UseGuards(RolesGuard)
  @Roles(Role.Vendor)
  async getMyProperties(
    @Query('name') name: string,
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.propertyService.getMyProperties(
      name,
      page,
      limit,
      req.user._id,
    );
  }

  @Patch()
  @UseGuards(RolesGuard)
  @Roles(Role.Vendor)
  async updateProperty(
    @Body() property: CreatePropertyDto,
    @Query('_id') _id: string,
    @Req() req: any,
  ) {
    try {
      return await this.propertyService.updateProperty(_id, property, req.user._id);
    } catch (err) {
      throw new HttpException(err.message, 400);
    }
  }

  @Post()
  @Roles(Role.Admin, Role.Vendor)
  @UseGuards(RolesGuard)
  async createProperty(@Body() property: CreatePropertyDto, @Req() req: any) {
    try {
      property.hostedById = req.user._id;
      return this.propertyService.createProperty(property);
    } catch (err) {
      throw new HttpException(err.message, 400);
    }
  }

  @Get('search')
  async getProperty(@Query() query: GetPropertyDto) {
    return this.propertyService.getProperty(query);
  }

  @Get('most-viewed')
  async getMostViewedProperties(@Query('limit') limit: number) {
    return this.propertyService.getMostViewedProperties(limit);
  }

  @Get('discount-rules')
  getDiscountRules() {
    return Object.entries(DiscountRules);
  }

  @Get('calculate-pricing')
  @UseGuards(RolesGuard)
  @Roles(Role.User, Role.Vendor)
  async calculatePricing(
    @Query('propertyId') propertyId: string,
    @Req() req: any,
    @Query('noOfPeople') noOfPeople?: number,
    @Query('noOfDays') noOfDays?: number,
    @Query('noOfRooms') noOfRooms?: number,
    @Query('noOfChildren') noOfChildren?: number,
    @Query('couponCode') couponCode?: string,

  ) {
    return this.propertyService.calculatePricing({
      propertyId,
      noOfPeople,
      noOfDays,
      noOfRooms,
      noOfChildren,
      couponCode,
    }, req.user._id, req.user.email);
  }

  // below related property type
  @Post('property-types')
  async createPropertyType(@Body() propertyType: any) {
    try {
      return this.propertyTypesService.createPropertyType(propertyType);
    } catch (err) {
      throw new HttpException(err.message, 400);
    }
  }

  @Get('property-types/:id')
  async getPropertyType(@Param('id') id: string) {
    return this.propertyTypesService.getPropertyType(id);
  }

  @Delete('property-types/:id')
  async deletePropertyType(@Param('id') id: string) {
    return this.propertyTypesService.deletePropertyType(id);
  }

  // categories
  @Post('category')
  async createCategory(@Body() category: any) {
    try {
      return this.propertyService.createCategory(category);
    } catch (err) {
      throw new HttpException(err.message, 400);
    }
  }

  @Get('category')
  async getCategories() {
    return this.propertyService.getCategories();
  }

  @Delete('category/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.propertyService.deleteCategory(id);
  }

  @Post('cities')
  @Roles(Role.User, Role.Admin)
  async addCity(
    @Body('city') city: string,
    @Body('state') state: string,
    @Body('image') image: string,
  ) {
    try {
      return this.propertyService.addCity(city, state, image);
    } catch (err) {
      throw new HttpException(err.message, 400);
    }
  }

  @Patch('cities')
  async updateCity(
    @Body('cityId') cityId: string,
    @Body('city') city: string,
    @Body('state') state: string,
    @Body('image') image: string,
    @Body('isActive') isActive: boolean,
  ) {
    try {
      return this.propertyService.updateCity({
        cityId,
        city,
        state,
        image,
        isActive,
      });
    } catch (err) {
      throw new HttpException(err.message, 400);
    }
  }

  @Get('recently-viewed')
  @UseGuards(RolesGuard)
  @Roles(Role.User, Role.Vendor)
  async getRecentlyViewedProperties(@Req() req: any) {
    return this.propertyService.getRecentlyViewedProperties({
      userId: req.user._id,
    });
  }

  @Get('amenities')
  async getAmenities() {
    return this.propertyService.getAmenities();
  }

  @Post('amenities')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Vendor)
  async createAmenities(@Body('amenities') amenities: any[]) {
    try {
      return this.propertyService.createAmenities(amenities);
    } catch (err) {
      throw new HttpException(err.message, 400);
    }
  }

  //   @Patch('amenities')
  //   async updateAmenities(
  //     @Body('amenitiesId') amenitiesId: string,
  //     @Body('amenities') amenities: string[],
  //   ) {
  //     try {
  //       return this.propertyService.updateAmenities(amenitiesId, amenities);
  //     } catch (err) {
  //       throw new HttpException(err.message, 400);
  //     }
  //   }

  //   @Delete('amenities/:id')
  //   async deleteAmenities(@Param('id') id: string) {
  //     try {
  //       return this.propertyService.deleteAmenities(id);
  //     } catch (err) {
  //       throw new HttpException(err.message, 400);
  //     }
  //   }

  @Get(':id')
  async getPropertyById(@Param('id') id: string) {
    return this.propertyService.getPropertyById(id);
  }


}
