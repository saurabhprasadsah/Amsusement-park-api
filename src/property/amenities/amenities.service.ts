import { Injectable, NotFoundException } from '@nestjs/common';
import { Amenities, AmenitiesDocument } from './amenities.schema';
import { CreateAmenitiesDto, UpdateAmenitiesDto } from "./amenities.dto"
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AmenitiesService {
    constructor(
        @InjectModel(Amenities.name) private amenitiesModel: Model<AmenitiesDocument>
    ) {}

    async create(createAmenityDto: CreateAmenitiesDto) {
        const amenity = new this.amenitiesModel(createAmenityDto);
        return amenity.save();
    }

    async findAll() {
        return this.amenitiesModel.find().exec();
    }

    async findOne(id: string) {
        const amenity = await this.amenitiesModel.findById(id).exec();
        if (!amenity) {
            throw new NotFoundException(`Amenity #${id} not found`);
        }
        return amenity;
    }

    async update(id: string, updateAmenityDto: UpdateAmenitiesDto) {
        const existingAmenity = await this.amenitiesModel.findByIdAndUpdate(id
            , updateAmenityDto, { new: true });
        if (!existingAmenity) {
            throw new NotFoundException(`Amenity #${id} not found`);
        }
        return existingAmenity;
    }

    async remove(id: string): Promise<void> {
        const result = await this.amenitiesModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Amenity #${id} not found`);
        }
    }
}