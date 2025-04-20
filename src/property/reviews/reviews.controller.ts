import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './reviews.dto';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('property/:propertyId')
  async getReviewsByProductId(@Param('propertyId') propertyId: string) {
    return await this.reviewsService.getReviewsByProductId(propertyId);
    // return {
    //   success: true,
    //   data: reviews,
    // };
  }
  @Get('user/:userId')
  async getReviewsByCreatedBy(@Param('userId') userId: string) {
    return await this.reviewsService.getReviewsByCreatedBy(userId);
    // return {
    //   success: true,
    //   data: reviews,
    // };
  }
  @Post('add')
      @UseGuards(RolesGuard)
  @Roles(Role.User)
  async addReview(@Body() body: CreateReviewDto, @Req() req) {
    const newReview = await this.reviewsService.addReview(body, req.user._id);
    return {
      success: true,
      data: newReview,
    };
  }
}
