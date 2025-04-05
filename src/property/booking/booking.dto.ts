import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateBooking {
    @IsString()
    propertyId: string;

    @IsBoolean()
    isPayLater: boolean;

    @IsNumber()
    @IsOptional()
    noOfPeople: number;

    @IsNumber()
    @IsOptional()
    noOfChildren: number;

    @IsNumber()
    @IsOptional()
    noOfRooms: number;

    @IsBoolean()
    @IsOptional()
    requestCallback: boolean;

    @IsString()
    @IsOptional()
    message: string;

    @IsString()
    @IsOptional()
    startDate: Date;

    @IsDate()
    @IsOptional()
    endDate: Date;

    @IsString()
    @IsOptional()
    couponCode: string;
}