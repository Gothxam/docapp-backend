import type { Express } from 'express';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Patient, PatientDocument } from '../../schema/patient.schema';
import { CreatePatientDto, UpdatePatientProfileDto } from './patient.dto';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import cloudinary from "../../config/cloudinary.config";

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(Patient.name)
    private patientModel: Model<PatientDocument>,
  ) {}

  // CREATE
  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const patient = new this.patientModel(createPatientDto);
    return patient.save();
  }
  
  // SIGNUP (PUBLIC)
// async signup(createPatientDto: CreatePatientDto) {
//   const existingPatient = await this.patientModel.findOne({
//     email: createPatientDto.email,
//   });

//   if (existingPatient) {
//     throw new ConflictException('Patient already exists with this email');
//   }

//   const hashedPassword = await bcrypt.hash(createPatientDto.password, 10);

//   const patient = new this.patientModel({
//     ...createPatientDto,
//     password: hashedPassword,
//     role: 'patient',
//   });

//   await patient.save();

//   return {
//     message: 'Patient registered successfully',
//   };
// }

  // READ ALL
  async findAll(): Promise<Patient[]> {
    return this.patientModel.find().exec();
  }

  // READ ONE
  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientModel.findById(id).exec();
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }

  // UPDATE
  async update(id: string, updatePatientDto: UpdatePatientProfileDto): Promise<Patient> {
    const updatedPatient = await this.patientModel.findByIdAndUpdate(
      id,
      updatePatientDto,
      { new: true },
    );

    if (!updatedPatient) {
      throw new NotFoundException('Patient not found');
    }

    return updatedPatient;
  }

  // SOFT DELETE
  async softDelete(id: string): Promise<{ message: string }> {
    const result = await this.patientModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );
    if (!result) {
      throw new NotFoundException('Patient not found');
    }
    return { message: 'Patient soft deleted successfully' };
  }

  // HARD DELETE
  async remove(id: string): Promise<{ message: string }> {
    const result = await this.patientModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Patient not found');
    }
    return { message: 'Patient deleted successfully' };
  }

  // UPLOAD PROFILE PICTURE
  async uploadProfilePicture(
    patientId: string,
    file: Express.Multer.File,
  ): Promise<{ message: string; profilePicture: string; publicId: string }> {
    console.log('\n=== UPLOAD DEBUG ===');
    console.log('File received:', {
      fieldname: file?.fieldname,
      originalname: file?.originalname,
      encoding: file?.encoding,
      mimetype: file?.mimetype,
      size: file?.size,
      hasBuffer: !!file?.buffer,
      bufferLength: file?.buffer?.length,
    });

    if (!file) {
      throw new BadRequestException('Profile image is required');
    }

    if (!file.buffer) {
      throw new BadRequestException('File buffer missing - storage not configured correctly');
    }

    if (!Types.ObjectId.isValid(patientId)) {
      throw new BadRequestException('Invalid patient id');
    }

    const patient = await this.patientModel.findOne({
      _id: patientId,
      isDeleted: false,
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    try {
      // 🔥 Convert buffer → base64
      const base64 = file.buffer.toString('base64');
      const dataUri = `data:${file.mimetype};base64,${base64}`;

      console.log('Uploading to Cloudinary...');

      // 🔥 Delete old image from Cloudinary if exists
      if (patient.profilePicturePublicId) {
        try {
          await cloudinary.uploader.destroy(patient.profilePicturePublicId);
        } catch (err) {
          console.warn(
            `Warning: Failed to delete old profile picture: ${err.message}`,
          );
        }
      }

      // 🔥 Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'patients/profile',
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      });

      console.log('Cloudinary upload successful:', result.secure_url);

      patient.profilePicture = result.secure_url;
      patient.profilePicturePublicId = result.public_id;
      await patient.save();

      return {
        message: 'Profile picture uploaded successfully',
        profilePicture: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new BadRequestException(
        `Failed to upload profile picture: ${error.message}`,
      );
    }
  }

}