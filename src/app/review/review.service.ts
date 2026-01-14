import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from '../../schema/review.schema';
import { Doctor, DoctorDocument } from '../../schema/doctor.schema';
import { CreateReviewDto } from './review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,

    @InjectModel(Doctor.name)
    private readonly doctorModel: Model<DoctorDocument>,
  ) {}

  // 🔹 CREATE REVIEW & SAVE REVIEW ID IN DOCTOR
  async createReview(dto: CreateReviewDto) {
    const doctorId = new Types.ObjectId(dto.doctorId);
    const patientId = new Types.ObjectId(dto.patientId);

    const doctor = await this.doctorModel.findById(doctorId);
    if (!doctor) throw new NotFoundException('Doctor not found');

    // prevent duplicate review (extra safety)
    const existing = await this.reviewModel.findOne({
      doctor: doctorId,
      patient: patientId,
    });
    if (existing) {
      throw new BadRequestException('You already reviewed this doctor');
    }

    const review = await this.reviewModel.create({
      doctor: doctorId,
      patient: patientId,
      rating: dto.rating,
      comment: dto.comment,
    });

    // push review id into doctor
    await this.doctorModel.updateOne(
      { _id: doctorId },
      { $push: { reviewids: review._id } },
    );

    return review;
  }

  // 🔹 GET DOCTOR REVIEWS WITH AGGREGATION
  async getDoctorReviews(doctorId: string) {
    return this.reviewModel.aggregate([
      {
        $match: {
          doctor: new Types.ObjectId(doctorId),
          isApproved: true,
        },
      },
      {
        $lookup: {
          from: 'patients',
          localField: 'patient',
          foreignField: '_id',
          as: 'patient',
        },
      },
      { $unwind: '$patient' },
      {
        $project: {
          rating: 1,
          comment: 1,
          createdAt: 1,
          patient: {
            name: '$patient.name',
            email: '$patient.email',
          },
        },
      },
    ]);
  }

  // 🔹 GET DOCTOR WITH REVIEWS + AVG RATING
  async getDoctorWithStats(doctorId: string) {
    return this.doctorModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(doctorId) },
      },
      {
        $lookup: {
          from: 'reviews',
          localField: 'reviewids',
          foreignField: '_id',
          as: 'reviews',
        },
      },
      { $unwind: { path: '$reviews', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          specialization: { $first: '$specialization' },
          reviews: { $push: '$reviews' },
          avgRating: { $avg: '$reviews.rating' },
          totalReviews: {
            $sum: {
              $cond: [{ $ifNull: ['$reviews._id', false] }, 1, 0],
            },
          },
        },
      },
    ]);
  }
}
