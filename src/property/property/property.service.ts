import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DiscountContains,
  DiscountRules,
  PricingTypes,
  Property,
  PropertyDocument,
} from 'src/schemas/property.schema';
import { CreatePropertyDto, GetPropertyDto } from './property.dto';
import {
  PropertyType,
  PropertyTypeDocument,
} from 'src/schemas/property-type.schema';
import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { City, CityDocument } from 'src/schemas/cities.schema';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name)
    private readonly propertySchema: Model<PropertyDocument>,
    @InjectModel(PropertyType.name)
    private readonly propertyTypeSchema: Model<PropertyTypeDocument>,
    @InjectModel(Category.name)
    private readonly categorySchema: Model<CategoryDocument>,
    @InjectModel(City.name)
    private readonly citySchema: Model<CityDocument>,
  ) {}

  async createProperty(property: CreatePropertyDto): Promise<Property> {
    try {
      return await this.propertySchema.create(property);
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, 400);
    }
  }

  async getProperty(query: GetPropertyDto): Promise<Property[]> {
    const { page = 1, limit = 10, propertyType, search } = query;

    const filter: any = {
      $or: [
        { name: { $regex: search || '', $options: 'i' }},
        { "address.city": { $regex: search || '', $options: 'i' }},
        { "address.state": { $regex: search || '', $options: 'i' }},
      ],
      isActive: true,
    };

    if (propertyType) filter['propertyType'] = propertyType;
    return this.propertySchema
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async getPropertyById(id: string): Promise<Property> {
    const result = await this.propertySchema.findById(id);
    if (!result) {
      throw new HttpException('Property not found', 404);
    }
    return result;
  }

  // below related property type
  async createPropertyType(propertyType: any) {
    try {
      await this.propertyTypeSchema.create(propertyType);
      return { success: true, message: 'Property Type Added' };
    } catch (err) {
      throw new HttpException(err.message, 400);
    }
  }

  async getPropertyTypes() {
    return this.propertyTypeSchema.find();
  }

  async getPropertyType(id: string) {
    return this.propertyTypeSchema.findById(id);
  }

  async deletePropertyType(id: string) {
    await this.propertyTypeSchema.deleteOne({ _id: id });
    return { success: true, message: 'Property Type Deleted' };
  }

  // below related category type
  async createCategory(category: any) {
    try {
      await this.categorySchema.create(category);
      return { success: true, message: 'Category Added' };
    } catch (err) {
      throw new HttpException(err.message, 400);
    }
  }

  async getCategories() {
    return this.categorySchema.find();
  }

  async deleteCategory(id: string) {
    await this.categorySchema.deleteOne({ _id: id });
    return { success: true, message: 'Category Deleted' };
  }

  async getCities() {
    return this.citySchema.find();
  }

  async addCity(city: string, state: string) {
    try {
      await this.citySchema.create({ city, state, isActive: true });
      return { success: true, message: 'City Added' };
    } catch (err) {
      throw new HttpException(err.message, 400);
    }
  }

  async getMyProperties(
    name: string,
    page: number = 1,
    limit: number = 10,
    userId: string,
  ) {
    const filter = {
      hostedById: userId,
    };
    if (name) filter['name'] = { $regex: name || '', $options: 'i' };
    return this.propertySchema
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async updateProperty(id: string, property, hostedById: string) {
    const result = await this.propertySchema.findOneAndUpdate(
      { _id: id, hostedById },
      { ...property },
      { new: true },
    );
    if (!result) {
      throw new HttpException('Property not found', 404);
    }
    return result;
  }

  async calculatePricing(priceCalculation: any) {
    const property = await this.propertySchema.findById(
      priceCalculation.propertyId,
    );
    if (!property) {
      throw new HttpException('Property not found', 404);
    }

    let totalAmount = 0;

    const findDiscount = (contains: DiscountContains) =>
      property.discount.find((discount) => {
        return discount.contains.includes(contains as any);
      });

    property.price.map((price) => {
      if (
        price.type === PricingTypes.PER_PEOPLE &&
        priceCalculation.noOfPeople > 0
      ) {
        let temp = 0;
        temp += price.amount * priceCalculation.noOfPeople;
        const discount = findDiscount(DiscountContains.PER_PEOPLE);
        if (discount && DiscountRules.GREATER_THAN) {
          temp -= (totalAmount * discount.amountInPercent) / 100;
        }
        totalAmount += temp;
      }

      if (
        price.type === PricingTypes.PER_CHILDREN &&
        priceCalculation.noOfChildren > 0
      ) {
        let temp = 0;
        temp += price.amount * priceCalculation.noOfChildren;
        const discount = findDiscount(DiscountContains.PER_CHILDREN);
        if (discount && DiscountRules.GREATER_THAN) {
          temp -= (totalAmount * discount.amountInPercent) / 100;
        }
        totalAmount += temp;
      }
    });

    const normalDiscounts = findDiscount(DiscountContains.NORMAL);
    if (normalDiscounts && DiscountRules.GREATER_THAN) {
      totalAmount -= (totalAmount * normalDiscounts.amountInPercent) / 100;
    }

    return { totalAmount, propertyId: property._id };
  }
}
