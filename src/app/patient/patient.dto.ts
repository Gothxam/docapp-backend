import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean, IsDateString, IsArray, isNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ example: 'patient@example.com' })
  @IsNotEmpty(  )
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPassword@123',
    description: 'Password will be hashed before saving',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiPropertyOptional({ example: 'patient', default: 'patient' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: '+91-9876543210' })
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ example: ['Diabetes', 'Hypertension'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalHistory?: string[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiPropertyOptional({ description: 'Profile picture filename' })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiPropertyOptional({ example: 'High blood pressure' })
  @IsOptional()
  @IsString()
  healthIssues?: string;

  @ApiPropertyOptional({ example: 'Peanut allergy' })
  @IsOptional()
  @IsString()
  allergy?: string;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({ example: '2025-05-01' })
  @IsOptional()
  @IsString()
  lastConsultation?: string;

  @ApiPropertyOptional({ example: 'No major illnesses' })
  @IsOptional()
  @IsString()
  healthHistory?: string;
}

export class UpdatePatientProfileDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '1990-01-01', description: 'Date of birth (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiPropertyOptional({
    example: ['Diabetes', 'Hypertension'],
    description: 'List of known medical conditions',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalHistory?: string[];

    @ApiPropertyOptional({
    example: 'New Delhi, India',
    description: 'Clinic or residential address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Peanut allergy' })
  @IsOptional()
  @IsString()
  allergy?: string;

  @ApiPropertyOptional({ example: 'High blood pressure' })
  @IsOptional()
  @IsString()
  healthIssues?: string;

  @ApiPropertyOptional({ example: 'No major illnesses' })
  @IsOptional()
  @IsString()
  healthHistory?: string;

  // ========== Emergency ==========
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({ example: '+91-9999999999' })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiPropertyOptional({ example: 'Spouse' })
  @IsOptional()
  @IsString()
  emergencyRelation?: string;

  // ========== Medical Details ==========
  @ApiPropertyOptional({ example: 'Asthma since childhood' })
  @IsOptional()
  @IsString()
  pastConditions?: string;

  @ApiPropertyOptional({ example: 'Metformin, Insulin' })
  @IsOptional()
  @IsString()
  medications?: string;

  @ApiPropertyOptional({ example: 'Appendectomy (2018)' })
  @IsOptional()
  @IsString()
  surgeries?: string;

}
