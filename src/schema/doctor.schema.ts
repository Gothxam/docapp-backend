import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DoctorDocument = Doctor & Document;

@Schema()
export class Doctor {
  @Prop({ default: true })
  isApproved: boolean;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  dateOfBirth: Date;

  @Prop({ required: true, select:false })
  password: string;

  @Prop({ default: 'doctor' })
  role: string;

  @Prop({
      type: [Types.ObjectId],
      ref: 'Review',
      required: false,
    })
    reviewids: Types.ObjectId[];

  @Prop({ required: false })
  specialization: string;

  @Prop({ required: false })
  licenseNumber: string;

  @Prop({ required: false })
  phoneNumber: string;

  @Prop({required:false})
  address:string

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ required: false })
  profilePicture: string;

  @Prop({required:false})
  fee:string

  @Prop({required:false})
  experience:string

  @Prop({required:false})
  myPatients:string

@Prop({
  type: {
    isAvailable: { type: Boolean, default: true },
    slots: [
      {
        day: { type: String },
        fromTime: { type: String },
        toTime: { type: String },
        _id: false,
      },
    ],
  },
  _id: false,
})
availability?: {
  isAvailable: boolean;
  slots: {
    day: string;
    fromTime: string;
    toTime: string;
  }[];
};

  @Prop({required:false})
  bio:string
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
DoctorSchema.index({ email: 1 }, { unique: true });
