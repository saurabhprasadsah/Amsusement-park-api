import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './reviews.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('property/:propertyId')
  async getReviewsByProductId(@Param('propertyId') propertyId: string) {
    const reviews = await this.reviewsService.getReviewsByProductId(propertyId);
    return {
      success: true,
      data: reviews,
    };
  }
  @Get('user/:userId')
  async getReviewsByCreatedBy(@Param('userId') userId: string) {
    const reviews = await this.reviewsService.getReviewsByCreatedBy(userId);
    return {
      success: true,
      data: reviews,
    };
  }
  @Post('add')
  async addReview(@Body() body: CreateReviewDto) {
    const newReview = await this.reviewsService.addReview(body);
    return {
      success: true,
      data: newReview,
    };
  }
}
