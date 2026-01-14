import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/* ================= CREATE APPOINTMENT ================= */

export class CreateAppointmentDto {
  @ApiProperty({
    example: '65a9f1c2e1234567890abcd',
    description: 'Doctor ID (ObjectId)',
  })
  @IsString()
  doctorId: string;

  @ApiProperty({
    example: '2026-01-21T10:30:00.000Z',
    description: 'Appointment date & time (ISO format)',
  })
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({
    example: 'Chest pain and breathing issues',
    description: 'Reason for appointment',
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    example: 'Patient has had symptoms for 3 days',
    description: 'Additional notes (optional)',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/* ================= UPDATE STATUS ================= */

export enum AppointmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  
}

export class UpdateAppointmentStatusDto {
  @ApiProperty({
    example: AppointmentStatus.APPROVED,
    enum: AppointmentStatus,
    description: 'Updated appointment status',
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}
