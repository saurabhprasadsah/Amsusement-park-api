import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBooking } from './booking.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';

@Controller('booking')
export class BookingController {
    constructor(
        private readonly bookingService: BookingService
    ){}

    @Post()
    @UseGuards(RolesGuard)
    @Roles(Role.User)
    async createBooking(
        @Body() booking: CreateBooking,
        @Req() req: any
    ) {
        return this.bookingService.createBooking(booking, req.user._id, req.user.email);
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(Role.User, Role.Vendor)
    async getBookings(
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Req() req: any
    ) {
        return this.bookingService.getMyBookings(req.user._id, req.user.role, { page, limit });
    }

    @Get('verify-booking-pass')
    async verifyBookingPass(
        @Query('qrCode') qrCode: string
    ){
        return this.bookingService.verifyBookingPass(qrCode);
    }

    @Get('get-booking-pass')
    async getBookingPass(
        @Query('bookingId') bookingId: string,
    ) {
        return this.bookingService.getBookingPass(bookingId);
    }
}
