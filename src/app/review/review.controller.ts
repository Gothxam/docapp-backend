import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './review.dto';

@ApiTags('Reviews')
@Controller('reviews')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiOperation({ summary: 'Patient creates a review for a doctor' })
  create(@Body() dto: CreateReviewDto) {
    return this.reviewService.createReview(dto);
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Get approved reviews of a doctor' })
  getDoctorReviews(@Param('doctorId') doctorId: string) {
    return this.reviewService.getDoctorReviews(doctorId);
  }

  @Get('doctor/:doctorId/stats')
  @ApiOperation({ summary: 'Get doctor profile with reviews & rating stats' })
  getDoctorStats(@Param('doctorId') doctorId: string) {
    return this.reviewService.getDoctorWithStats(doctorId);
  }
}
