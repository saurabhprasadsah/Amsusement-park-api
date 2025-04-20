import { IsString, IsNumber, IsOptional, IsUUID, Max, Min, Length } from 'class-validator';

export class CreateReviewDto {
    @IsString()
    propertyId: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    @Length(1, 500)
    review: string;
}

export class UpdateReviewDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating?: number;

    @IsOptional()
    @IsString()
    @Length(1, 500)
    comment?: string;
}

export class ReviewResponseDto {
    id: string;
    propertyId: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}