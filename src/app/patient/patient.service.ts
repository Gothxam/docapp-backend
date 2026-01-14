import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Patient, PatientDocument } from '../../schema/patient.schema';
import { CreatePatientDto, UpdatePatientProfileDto } from './patient.dto';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';

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
    ): Promise<{ message: string; profilePicture: string }> {
  
      if (!Types.ObjectId.isValid(patientId)) {
        throw new BadRequestException('Invalid patient id');
      }
  
      const patient = await this.patientModel.findOne({
        _id: patientId,
        isDeleted: false,
      });
  
      if (!patient) {
        throw new NotFoundException('Doctor not found');
      }
  
      const imagePath = `/uploads/patients/${file.filename}`;
  
      patient.profilePicture = file.filename;
      await patient.save();
  
      return {
        message: 'Profile picture uploaded successfully',
        profilePicture: imagePath,
      };
    }
  }
