import type { Express } from 'express';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Doctor, DoctorDocument } from '../../schema/doctor.schema';
import { CreateDoctorDto, UpdateDoctorAdminDto,  UpdateDoctorProfileDto } from './doctor.dto';
import { ConflictException } from '@nestjs/common';
import cloudinary from '../../config/cloudinary.config';



@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name)
    private readonly doctorModel: Model<DoctorDocument>,
  ) {}

  // ================= CREATE =================
  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const existingDoctor = await this.doctorModel.findOne({
      email: createDoctorDto.email,
    });

    if (existingDoctor) {
      throw new BadRequestException('Doctor with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createDoctorDto.password, 10);

    const doctor = new this.doctorModel({
      ...createDoctorDto,
      password: hashedPassword,
      role:'doctor'
    });

    return doctor.save();
  }

  // ================= DOCTOR SIGNUP (PUBLIC) =================
// async signup(createDoctorDto: CreateDoctorDto) {
//   const existingDoctor = await this.doctorModel.findOne({
//     email: createDoctorDto.email,
//   });

//   if (existingDoctor) {
//     throw new ConflictException('Doctor already exists with this email');
//   }

//   const hashedPassword = await bcrypt.hash(createDoctorDto.password, 10);

//   const doctor = new this.doctorModel({
//     ...createDoctorDto,
//     password: hashedPassword,
//     role: 'doctor',
//     isApproved: false, // 🔐 admin approval required
//   });

//   await doctor.save();

//   return {
//     message: 'Doctor registered successfully. Awaiting admin approval.',
//   };
// }

  // ================= READ ALL =================
  async findAll(): Promise<any[]> {
    const doctors = await this.doctorModel
      .find({ isDeleted: false })
      .select('-password')
      .lean()
      .exec();

    // Transform profilePicture URLs
    return doctors.map(doctor => ({
      ...doctor,
      profilePicture: doctor.profilePicture?.startsWith('http') 
        ? doctor.profilePicture 
        : null,
    }));
  }

  // ================= READ ONE =================
  async findOne(id: string): Promise<any> {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid doctor id');
  }

  const doctor = await this.doctorModel
    .findOne({ _id: id, isDeleted: false })
    .select('-password')
    .lean(); // important to get plain JS object

  if (!doctor) {
    throw new NotFoundException('Doctor not found');
  }

  // Handle both Cloudinary URLs and old local filenames
  let profilePicture: string | null = null;
  if (doctor.profilePicture) {
    // If already a full URL (from Cloudinary), return as-is
    if (doctor.profilePicture.startsWith('http')) {
      profilePicture = doctor.profilePicture;
    } else {
      // Old local filename - skip for now (files don't exist)
      profilePicture = null;
    }
  }

  return {
    ...doctor,
    profilePicture,
  };
}

  

  // ================= SOFT DELETE =================
  async softDelete(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid doctor id');
    }

    const doctor = await this.doctorModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return { message: 'Doctor soft deleted successfully' };
  }

  // ================= HARD DELETE =================
  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid doctor id');
    }

    const doctor = await this.doctorModel.findByIdAndDelete(id);

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return { message: 'Doctor deleted permanently' };
  }

  // ================= UPLOAD PROFILE PICTURE =================
  async uploadProfilePicture(
    doctorId: string,
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

    if (!Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException('Invalid doctor id');
    }

    const doctor = await this.doctorModel.findOne({
      _id: doctorId,
      isDeleted: false,
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    try {
      // 🔥 Convert buffer → base64
      const base64 = file.buffer.toString('base64');
      const dataUri = `data:${file.mimetype};base64,${base64}`;

      console.log('Uploading to Cloudinary...');

      // 🔥 Delete old image from Cloudinary if exists
      if (doctor.profilePicturePublicId) {
        try {
          await cloudinary.uploader.destroy(doctor.profilePicturePublicId);
        } catch (err) {
          console.warn(
            `Warning: Failed to delete old profile picture: ${err.message}`,
          );
          // Don't throw error, continue with upload
        }
      }

      // 🔥 Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'doctors/profile',
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      });

      console.log('Cloudinary upload successful:', result.secure_url);

      doctor.profilePicture = result.secure_url;
      doctor.profilePicturePublicId = result.public_id;
      await doctor.save();

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


  // ================= ADMIN UPDATE =================
async update(
  id: string,
  updateDoctorDto: UpdateDoctorAdminDto,
): Promise<Doctor> {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid doctor id');
  }

  const updatedDoctor = await this.doctorModel
    .findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateDoctorDto,
      { new: true },
    )
    .select('-password');

  if (!updatedDoctor) {
    throw new NotFoundException('Doctor not found');
  }

  return updatedDoctor;
}

// ================= PROFILE UPDATE =================
async updateProfile(
  doctorId: string,
  dto: UpdateDoctorProfileDto,
): Promise<Doctor> {
  const doctor = await this.doctorModel
    .findOneAndUpdate(
      { _id: doctorId, isDeleted: false },
      dto,
      { new: true },
    )
    .select('-password');

  if (!doctor) {
    throw new NotFoundException('Doctor not found');
  }

  return doctor;
}
}
