import { Body, Controller, Delete, Get, HttpException, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto, GetPropertyDto } from './property.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { RolesGuard } from 'src/auth/roles.guard';
import { DiscountContains, DiscountRules, PricingTypes } from 'src/schemas/property.schema';

@Controller('property')
export class PropertyController {
    constructor(
        private readonly propertyService: PropertyService,
        private readonly propertyTypesService: PropertyService
    ) { }

    @Get('property-pricing-types')
    getPropertyPricingTypes() {
        // i want o
        return Object.entries(PricingTypes)
        // .map(([key, value]) => ({ key: key, value: value }))
    }

    @Get('property-discount-contains')
    getPropertyDiscountCOntains() {
        return Object.entries(DiscountContains)
    }

    @Get("property-types")
    async getPropertyTypes() {
        return this.propertyTypesService.getPropertyTypes();
    }

    @Get('cities')
    async getCities() {
        return this.propertyService.getCities();
    }

    @Post()
    @Roles(Role.Admin, Role.Vendor)
    @UseGuards(RolesGuard)
    async createProperty(
        @Body() property: CreatePropertyDto,
        @Req() req: any
    ) {
        try {
            property.hostedById = req.user._id;
            return this.propertyService.createProperty(property);
        } catch (err) {
            throw new HttpException(err.message, 400);
        }
    }

    @Get('search')
    async getProperty(
        @Query() query: GetPropertyDto
    ) {
        return this.propertyService.getProperty(query);
    }

    @Get('discount-rules')
    getDiscountRules() {
        return Object.entries(DiscountRules)
    }

    @Get('calculate-pricing')
    async calculatePricing(
        @Query('propertyId') propertyId: string,
        @Query('noOfPeople') noOfPeople?: number,
        @Query('noOfDays') noOfDays?: number,
        @Query('noOfRooms') noOfRooms?: number,
        @Query('noOfChildren') noOfChildren?: number,
    ){
        return this.propertyService.calculatePricing({
            propertyId,
            noOfPeople,
            noOfDays,
            noOfRooms,
            noOfChildren
        })
    }


    // below related property type
    @Post("property-types")
    async createPropertyType(
        @Body() propertyType: any
    ) {
        try {
            return this.propertyTypesService.createPropertyType(propertyType);
        } catch (err) {
            throw new HttpException(err.message, 400);
        }
    }

    @Get("property-types/:id")
    async getPropertyType(
        @Param('id') id: string
    ) {
        return this.propertyTypesService.getPropertyType(id);
    }

    @Delete("property-types/:id")
    async deletePropertyType(
        @Param('id') id: string
    ) {
        return this.propertyTypesService.deletePropertyType(id);
    }

    // categories
    @Post('category')
    async createCategory(
        @Body() category: any
    ) {
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
    async deleteCategory(
        @Param('id') id: string
    ) {
        return this.propertyService.deleteCategory(id);
    }

    @Post('cities')
    @Roles(Role.User, Role.Admin)
    async addCity(
        @Body('city') city: string,
        @Body('state') state: string,
    ) {
        try {
            return this.propertyService.addCity(city, state);
        } catch (err) {
            throw new HttpException(err.message, 400);
        }
    }

    @Get(':id')
    async getPropertyById(
        @Param('id') id: string
    ) {
        return this.propertyService.getPropertyById(id);
    }
}
