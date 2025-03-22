import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { City, CityDocument } from 'src/schemas/cities.schema';

@Injectable()
export class CityService {
    constructor(@InjectModel(City.name) private cityModel: Model<CityDocument>){

    }

    async createCity(city: any): Promise<City> {
        return this.cityModel.create(city);
    }

    async getCities(): Promise<City[]> {
        return this.cityModel.find();
    }

    async deleteCity(id:string){
        return this.cityModel.deleteOne({ _id: id });
    }
}
