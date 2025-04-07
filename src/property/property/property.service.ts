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
import { DiscountCalculatorService } from 'src/shared/discount-calculator.service';
import { Auth, AuthDocument } from 'src/schemas/auth.schema';
import { Amenity, AmenityDocument } from 'src/schemas/amenities.schema';
import { CouponsService } from 'src/coupons/coupons.service';

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
    private discountCalculatorService: DiscountCalculatorService,
    @InjectModel(Auth.name)
    private readonly authSchema: Model<AuthDocument>,
    @InjectModel(Amenity.name)
    private readonly amenitySchema: Model<AmenityDocument>,
    private couponService: CouponsService,
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
        { name: { $regex: search || '', $options: 'i' } },
        { 'address.city': { $regex: search || '', $options: 'i' } },
        { 'address.state': { $regex: search || '', $options: 'i' } },
      ],
      isActive: true,
    };

    if (propertyType && propertyType != 'null')
      filter['propertyType'] = propertyType;

    const result = await this.propertySchema
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return this.addDiscounts(result);
  }

  addDiscounts(result) {
    const mappedWithDiscount = result.map((property) => {
      const visiblePrice: any[] = [];

      property.price.map((price) => {
        if (price.type === PricingTypes.PER_PEOPLE) {
          const p = this.discountCalculatorService.calculatePersonDiscount({
            price,
            noOfPeople: 1,
            property,
          });
          visiblePrice.push({
            label: this.formatLabel(PricingTypes.PER_PEOPLE),
            actualAmount: p.originalAmount,
            discountedAmount:
              p.discountedAmount === 0 ? p.originalAmount : p.discountedAmount,
          });
        }

        if (price.type === PricingTypes.PER_CHILDREN) {
          const p = this.discountCalculatorService.calculateChildrenDiscount({
            price,
            noOfChildren: 1,
            property,
          });
          visiblePrice.push({
            label: this.formatLabel(PricingTypes.PER_CHILDREN),
            actualAmount: p.originalAmount,
            discountedAmount:
              p.discountedAmount === 0 ? p.originalAmount : p.discountedAmount,
          });
        }
      });

      function getMinDiscountedPrice(prices) {
        return prices.reduce((minObj, currentObj) => {
          return currentObj.discountedAmount < minObj.discountedAmount
            ? currentObj
            : minObj;
        });
      }

      return {
        ...property,
        visiblePrice: getMinDiscountedPrice(visiblePrice),
      };
    });

    return mappedWithDiscount;
  }

  formatLabel(label: string) {
    let split: any | any[] = label.toLowerCase().split('_');
    split = split
      .map((i) => i[0].toUpperCase() + i.slice(1, i.length))
      .join(' ');
    return split;
  }

  async getPropertyById(id: string): Promise<Property> {
    const result = await this.propertySchema.findById(id).populate('amenities');
    if (!result) {
      throw new HttpException('Property not found', 404);
    }

    result.viewCount = result.viewCount + 1;
    await result.save();
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

  async getMostViewedProperties(limit) {
    const result = await this.propertySchema
      .find({ isActive: true })
      .sort({ viewCount: -1 })
      .limit(limit || 4)
      .lean();

    return this.addDiscounts(result);
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
    return this.citySchema.find({ isActive: true });
  }

  async addCity(city: string, state: string, image: string) {
    try {
      await this.citySchema.create({ city, state, image, isActive: true });
      return { success: true, message: 'City Added' };
    } catch (err) {
      throw new HttpException(err.message, 400);
    }
  }

  async updateCity({ cityId, city, state, image, isActive }) {
    const result = await this.citySchema.findByIdAndUpdate(
      cityId,
      { city, state, image, isActive },
      { new: true },
    );
    if (!result) {
      throw new HttpException('City not found', 404);
    }
    return result;
  }

  async getMyProperties(
    name: string,
    page: number = 1,
    limit: number = 10,
    userId: string,
  ) {
    const filter = {
      hostedById: userId,
      isActive: true,
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

  async getRecentlyViewedProperties({ userId }) {
    const user = await this.authSchema
      .findById(userId)
      .select('propertyHistory')
      .lean();

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    try {
      const str = user.propertyHistory
        .slice(user.propertyHistory.length - 5, user.propertyHistory.length)
        .reverse();
      console.log('STR', str, str.length);
      const result = await this.propertySchema
        .find({ _id: { $in: [...str] } })
        .lean();
      return this.addDiscounts(result);
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  getAmenities() {
    return this.amenitySchema.find();
  }

  createAmenities(amenities: any[]) {
    return this.amenitySchema.insertMany(amenities);
  }

  async calculatePricing(priceCalculation: any, userId: string, email:string) {
    const property = await this.propertySchema.findById(
      priceCalculation.propertyId,
    );
    if (!property) {
      throw new HttpException('Property not found', 404);
    }

    let totalAmount = 0;
    let originalAmount = 0;
    const offers: any[] = [];
    const priceBreakup: any[] = [];
    const allOffers = new Set();
    property.discount.forEach((discount) => allOffers.add(discount.label));

    property.price.map((price) => {
      if (
        price.type === PricingTypes.PER_PEOPLE &&
        priceCalculation.noOfPeople > 0
      ) {
        const p = this.discountCalculatorService.calculatePersonDiscount({
          price,
          noOfPeople: priceCalculation.noOfPeople,
          property,
        });
        totalAmount += p.discountedAmount;
        originalAmount += p.originalAmount;

        if (p.offerMessage) offers.push(p.offerMessage);
        priceBreakup.push({
          originalAmount: p.originalAmount,
          discountedAmount:
            p.discountedAmount === 0 ? p.originalAmount : p.discountedAmount,
          pricing: priceCalculation.noOfPeople + ' People',
          type: price.type,
        });
      }

      if (
        price.type === PricingTypes.PER_CHILDREN &&
        priceCalculation.noOfChildren > 0
      ) {
        const p = this.discountCalculatorService.calculateChildrenDiscount({
          price,
          noOfChildren: priceCalculation.noOfChildren,
          property,
        });
        totalAmount += p.discountedAmount;
        originalAmount += p.originalAmount;

        if (p.offerMessage) offers.push(p.offerMessage);
        priceBreakup.push({
          originalAmount: p.originalAmount,
          discountedAmount:
            p.discountedAmount === 0 ? p.originalAmount : p.discountedAmount,
          pricing: priceCalculation.noOfChildren + ' Children',
          type: price.type,
        });
      }
    });

    let couponResult: any = null;

    const offersSet = new Set();
    offers.forEach((item) => {
      offersSet.add(item);
    });

    if (priceCalculation.couponCode) {
      const coupon = await this.couponService.verifyCoupon({
        couponCode: priceCalculation.couponCode,
        userId: userId,
        totalAmount,
        propertyId: property._id as string,
        email: email
      });

      if (coupon && coupon.success) {
        totalAmount -= coupon.coupon?.discountAmountFlat || 0;
        couponResult = `Coupon applied! You saved ₹${coupon.coupon?.discountAmountFlat}`;
        offersSet.add(`Coupon applied! You saved ₹${coupon.coupon?.discountAmountFlat}`);
      } else {
        couponResult = coupon.message;
      }
    }

    return {
      offersApplied: [...offersSet],
      discountedAmount: totalAmount,
      priceBreakup,
      originalAmount,
      propertyId: property._id,
      allOffers: [...allOffers],
      couponResult,
    };
  }
}
