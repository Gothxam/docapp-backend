import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AppointmentService } from "./appointment.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateAppointmentDto, UpdateAppointmentStatusDto } from "./appointment.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
  ) {}

  // Patient creates appointment
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Req() req: any,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentService.create(
      req.user.id,
      dto.doctorId,
      dto,
    );
  }

  // Doctor / Patient dashboard
  @Get()
  @UseGuards(AuthGuard('jwt'))
  findMyAppointments(
    @Req() req: any,
    @Query('status') status?: string,
  ) {
    return this.appointmentService.findByUser(
      req.user.id,
      req.user.role,
      status,
    );
  }

// Doctor updates appointment status
  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
updateStatus(
  @Param('id') id: string,
  @Body() dto: UpdateAppointmentStatusDto,
  @Req() req: any,
) {
  return this.appointmentService.updateStatus(
    id,
    dto.status,
    req.user,
    
  );
  
}

// appointment.controller.ts
@Get('doctor')
@UseGuards(JwtAuthGuard)
async getDoctorAppointments(@Req() req) {
  // req.user.sub or req.user.id depending on your JWT
  return this.appointmentService.getAppointmentsForDoctor(req.user.id)
}



}
