import { IsString } from "class-validator";

export class CreateCityDto {

    @IsString()
    city: string

    @IsString()
    state: string
}