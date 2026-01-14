import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Appointment, AppointmentStatus } from "src/schema/appointment.schema";
import { CreateAppointmentDto } from "./appointment.dto";
import { Doctor } from "src/schema/doctor.schema";

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<Appointment>,
    @InjectModel(Doctor.name)
    private doctorModel: Model<Doctor>,
  ) {}

  // CREATE
  async create(
  patientId: string,
  doctorId: string,
  dto: CreateAppointmentDto,
): Promise<Appointment> {

  // ✅ PASTE THIS BLOCK HERE (AT THE TOP)
  const doctorExists = await this.doctorModel.exists({ _id: doctorId });
  if (!doctorExists) {
    throw new NotFoundException('Doctor not found');
  }

  return this.appointmentModel.create({
    patient: patientId,
    doctor: doctorId,
    appointmentDate: new Date(dto.appointmentDate), // ✅ fixed
    reason: dto.reason,
    notes: dto.notes,
    status: AppointmentStatus.PENDING,
  });

}

  // DOCTOR / PATIENT DASHBOARD
  async findByUser(
  userId: string,
  role: string,
  status?: string,
) {
  // 🔐 ROLE VALIDATION (PASTE HERE)
  if (!['doctor', 'patient'].includes(role)) {
    throw new ForbiddenException('Invalid role');
  }

  const query: any = {
    [role]: userId,
  };

  if (status) {
    query.status = status;
  }

  return this.appointmentModel
    .find(query)
    .populate(
      role === 'doctor'
        ? 'patient'
        : 'doctor',
      role === 'doctor'
        ? 'name email phoneNumber profilePicture'
        : 'name specialization fee profilePicture',
    )
    .sort({ createdAt: -1,            // pending → approved → completed
    appointmentDate: -1,  
     });
}


  // UPDATE STATUS
  async updateStatus(
    appointmentId: string,
    status: AppointmentStatus,
    user: any,
  ) {
    const appointment = await this.appointmentModel.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // ================= PATIENT CANCEL =================
    if (user.role === 'patient') {
      if (status !== AppointmentStatus.CANCELLED) {
        throw new ForbiddenException('Patient can only cancel appointment');
      }

      if (appointment.patient.toString() !== user.id) {
        throw new ForbiddenException('Not your appointment');
      }

      if (
        ![AppointmentStatus.PENDING, AppointmentStatus.APPROVED].includes(
          appointment.status,
        )
      ) {
        throw new BadRequestException('Cannot cancel this appointment');
      }

      appointment.status = AppointmentStatus.CANCELLED;
      return appointment.save();
    }

    // ================= DOCTOR ACTIONS =================
    if (user.role !== 'doctor') {
      throw new ForbiddenException('Unauthorized');
    }

    if (appointment.doctor.toString() !== user.id) {
      throw new ForbiddenException('Not your appointment');
    }

    const allowedTransitions = {
  [AppointmentStatus.PENDING]: [
    AppointmentStatus.APPROVED,
    AppointmentStatus.REJECTED,
  ],
  [AppointmentStatus.APPROVED]: [AppointmentStatus.COMPLETED],
};

    if (!allowedTransitions[appointment.status]?.includes(status)) {
      throw new BadRequestException(
        `Cannot change status from ${appointment.status} to ${status}`,
      );
    }

    appointment.status = status;
    return appointment.save();
  }

  // appointment.service.ts
async getAppointmentsForDoctor(doctorId: string) {
  return this.appointmentModel
    .find({ doctorId })
    .populate('patientId', 'name email phoneNumber')
    .sort({ appointmentDate: -1 })
}


}
