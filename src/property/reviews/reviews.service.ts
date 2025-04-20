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

  async addReview(body: CreateReviewDto) {
    const newReview = new this.reviewModel(body);
    await newReview.save();
    return { success: true, message: "Review added successfully", data: newReview };
  }

  async getReviewsByProductId(propertyId: string): Promise<Review[]> {
    return this.reviewModel.find({ propertyId }).populate({ path: "ratedBy", select: "name" });
  }

  async getReviewsByCreatedBy(ratedBy: string): Promise<Review[]> {
    return this.reviewModel.find({ ratedBy }).populate({ path: "ratedBy", select: "name" });
  }
}
