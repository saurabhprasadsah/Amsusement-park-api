import { IsNumber, IsString } from "class-validator";

export class CreateOrder {
    @IsString()
    bookingId: string;

    @IsNumber()
    amount: number;

}