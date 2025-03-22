import { Body, Controller, Delete, Get, HttpException, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto, GetPropertyDto } from './property.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('property')
export class PropertyController {
    constructor(
        private readonly propertyService: PropertyService,
        private readonly propertyTypesService: PropertyService
    ) {}

    @Post()
    @Roles(Role.Admin)
    async createProperty(
        @Body() property: CreatePropertyDto,
        @Req() req: any
    ) {
        console.log("Controller", req.user)
        try{
            return this.propertyService.createProperty(property);
        } catch(err) {
            throw new HttpException(err.message, 400);
        }
    }

    @Get('search')
    async getProperty(
        @Query() query: GetPropertyDto
    ) {
        return this.propertyService.getProperty(query);
    }

    // below related property type
    @Post("property-types")
    async createPropertyType(
        @Body() propertyType: any
    ) {
        try{
            return this.propertyTypesService.createPropertyType(propertyType);
        } catch(err) {
            throw new HttpException(err.message, 400);
        }
    }

    @Get("property-types")
    async getPropertyTypes() {
        return this.propertyTypesService.getPropertyTypes();
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
        try{
            return this.propertyService.createCategory(category);
        } catch(err) {
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

}
