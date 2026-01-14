import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';


export class CreateDoctorDto {
  @ApiProperty({
    example: 'Dr. John Doe',
    description: 'Full name of the doctor',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'doctor@example.com',
    description: 'Unique email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPassword@123',
    description: 'Password (will be hashed before saving)',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiPropertyOptional({
    example: 'Cardiologist',
    description: 'Medical specialization',
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({
    example: 'LIC-908273',
    description: 'Medical license number',
  })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({
    example: 'New Delhi, India',
    description: 'Clinic or residential address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: '+91-9876543210',
    description: 'Contact phone number',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'O+',
    description: 'Blood group',
  })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiPropertyOptional({
    example: '10 years',
    description: 'Total years of experience',
  })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiPropertyOptional({
    example: 'Specialist in heart-related treatments',
    description: 'Doctor bio',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: '1200+',
    description: 'Total patients handled',
  })
  @IsOptional()
  @IsString()
  myPatients?: string;
}



// ==================update-dto=============


class AvailabilitySlotDto {
  @IsString()
  day: string

  @IsString()
  fromTime: string

  @IsString()
  toTime: string
}
class AvailabilityDto {
  @IsBoolean()
  isAvailable: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  slots: AvailabilitySlotDto[];
}
export class UpdateDoctorProfileDto {
  @ApiPropertyOptional({
    example: 'Dr. John Doe',
    description: 'Updated name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Neurologist',
    description: 'Updated specialization',
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({
  example: ["Mon 9:00 AM - 5:00 PM", "Wed 9:00 AM - 5:00 PM"],
  description: 'Updated availability'
  })

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => AvailabilityDto)
  availability?: AvailabilityDto;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({
    example: 'Mumbai, India',
    description: 'Updated address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: '+91-9000000000',
    description: 'Updated phone number',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: '12 years',
    description: 'Updated experience',
  })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiPropertyOptional({
    example: 'Expert in brain surgeries',
    description: 'Updated bio',
  })
  @IsOptional()
  @IsString()
  bio?: string;

 @ApiPropertyOptional({
  example: 500,
  description: 'Consultation fee',
})
@IsOptional()
@Type(() => Number)
@IsNumber()
fee?: number;

  @ApiPropertyOptional({
    example: '1500+',
    description: 'Updated patient count',
  })
  @IsOptional()
  @IsString()
  myPatients?: string;
}

//==================admin-update-dto================
export class UpdateDoctorAdminDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Doctor availability status',
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Soft delete flag',
  })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiPropertyOptional({
    example: 'doctor',
    description: 'Role management (admin only)',
  })
  @IsOptional()
  @IsString()
  role?: string;
}

