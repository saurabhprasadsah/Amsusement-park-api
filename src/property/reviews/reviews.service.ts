import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from 'src/schemas/reviews.schems';
import { CreateReviewDto } from './reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async addReview(body: CreateReviewDto, userId:string) {
    console.log('userId', userId);
    const newReview = new this.reviewModel({...body, ratedBy: userId});
    await newReview.save();
    return newReview 
  }

  async getReviewsByProductId(propertyId: string): Promise<Review[]> {
    return this.reviewModel.find({ propertyId }).populate({ path: "ratedBy", select: "name" });
  }

  async getReviewsByCreatedBy(ratedBy: string): Promise<Review[]> {
    return this.reviewModel.find({ ratedBy }).populate({ path: "ratedBy", select: "name" });
  }
}
