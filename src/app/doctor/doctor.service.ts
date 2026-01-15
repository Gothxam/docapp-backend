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
  async findAll(): Promise<Doctor[]> {
    return this.doctorModel
      .find({ isDeleted: false })
      .select('-password')
      .exec();
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

  return {
    ...doctor,
    profilePicture: doctor.profilePicture
      ? `${process.env.BACKEND_URL}/uploads/doctors/${doctor.profilePicture}`
      : null,
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
  ): Promise<{ message: string; profilePicture: string }> {

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

    const imagePath = `/uploads/doctors/${file.filename}`;

    doctor.profilePicture = file.filename;
    await doctor.save();

    return {
      message: 'Profile picture uploaded successfully',
      profilePicture: imagePath,
    };
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
