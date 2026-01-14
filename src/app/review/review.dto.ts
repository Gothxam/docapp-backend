import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: '665c3c3c3c3c3c3c3c3c3c3c' })
  @IsMongoId()
  doctorId: string;

  @ApiProperty({ example: '665c3c3c3c3c3c3c3c3c3c9a' })
  @IsMongoId()
  patientId: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Very professional doctor', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
