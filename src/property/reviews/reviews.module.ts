import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from 'src/schemas/reviews.schems';
import { JwtModule } from '@nestjs/jwt';
import { Auth, AuthSchema } from 'src/schemas/auth.schema';

@Module({
  imports:[
    JwtModule.register({}),
    MongooseModule.forFeature([
      {
        name: Review.name,
        schema: ReviewSchema
      },
      {
        name: Auth.name,
        schema: AuthSchema
      },
    ])
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService]
})
export class ReviewsModule {}
