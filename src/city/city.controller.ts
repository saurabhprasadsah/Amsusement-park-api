import { Body, Controller, Get, HttpException, Post } from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto } from './city.dto';

@Controller('city')
export class CityController {
    constructor(
        private readonly cityService: CityService
        
    ) {}

    @Post()
    async createCity(
        @Body() city: CreateCityDto
    ) {
        try{
            return this.cityService.createCity(city);
        } catch(err) {
            throw new HttpException(err.message, 400);
        }
    }

    @Get()
    async getCities() {
        return this.cityService.getCities();
    }

}
