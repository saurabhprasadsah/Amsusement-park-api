import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { CreateAmenitiesDto, UpdateAmenitiesDto } from './amenities.dto';

@Controller('amenities')
export class AmenitiesController {
    constructor(private readonly amenitiesService: AmenitiesService) {}

    @Post()
    async create(@Body() createAmenityDto: CreateAmenitiesDto) {
        return this.amenitiesService.create(createAmenityDto);
    }

    @Get()
    async findAll() {
        return this.amenitiesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.amenitiesService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateAmenityDto: UpdateAmenitiesDto) {
        return this.amenitiesService.update(id, updateAmenityDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.amenitiesService.remove(id);
    }
}