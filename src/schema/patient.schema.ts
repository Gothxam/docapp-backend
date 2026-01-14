import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Review } from '../../src/schema/review.schema';

export type PatientDocument = Patient & Document;

@Schema({ timestamps: true })
export class Patient {
  @Prop({ required: true })
  name: string;

 @Prop({required:false})
 address:string
  
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: 'patient' })
  role: string;

  @Prop()
  dateOfBirth: string;

  @Prop()
  phoneNumber: string;

  @Prop({ type: [String], default: [] })
  medicalHistory: string[];

  @Prop()
  bloodType: string;

  @Prop()
  profilePicture: string;

  @Prop()
  healthIssues: string;

  @Prop()
  allergy: string;

  @Prop()
  healthHistory: string;

  // 🔹 Emergency
  @Prop()
  emergencyContact: string;

  @Prop()
  emergencyPhone: string;

  @Prop()
  emergencyRelation: string;

  // 🔹 Medical details
  @Prop()
  pastConditions: string;

  @Prop()
  medications: string;

  @Prop()
  surgeries: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Review', default: [] })
  reviewIds: Types.ObjectId[];
}


export const PatientSchema = SchemaFactory.createForClass(Patient);
PatientSchema.index({ email: 1 }, { unique: true });
