import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({
  timestamps: true,
  collection: 'reviews',
})
export class Review {

  @Prop({
    type: Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true,
  })
  doctor: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true,
  })
  patient: Types.ObjectId;

  @Prop({
    required: true,
    min: 1,
    max: 5,
  })
  rating: number;

  @Prop({
    trim: true,
    maxlength: 500,
  })
  comment?: string;

  @Prop({
    default: false,
  })
  isApproved: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index(
  { doctor: 1, patient: 1 },
  { unique: true }
);
