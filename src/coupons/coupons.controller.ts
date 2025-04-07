import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { Role } from 'src/auth/role.enum';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateCouponsDto } from './coupons.dto';

@Controller('coupons')
export class CouponsController {
    constructor(
        private couponService: CouponsService
    ){}

    @Post('create-coupon')
    @UseGuards(RolesGuard)
    @Roles(Role.Admin, Role.Vendor)
    async createCoupon(
        @Body() coupon: CreateCouponsDto,
        @Req() req: any
    ) {
        return this.couponService.createCoupon(coupon, req.user._id);
    }

    @Get('get-coupons')
    @UseGuards(RolesGuard)
    @Roles(Role.Admin, Role.Vendor)
    async getCoupons(
        @Req() req: any
    ) {
        return this.couponService.getCoupons(req.user._id);
    }


    // @Post('verify-coupon')
    // @UseGuards(RolesGuard)
    // @Roles(Role.User, Role.Admin, Role.Vendor)
    // async verifyCoupon(
    //     @Body('couponCode') couponCode: string,
    //     @Req() req: any
    // ){
    //     return this.couponService.verifyCoupon(couponCode, req.user._id);
    // }

}
