import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from 'src/schema/admin.schema';
import { Doctor, DoctorDocument } from 'src/schema/doctor.schema';
import { Patient, PatientDocument } from 'src/schema/patient.schema';
import { BcryptService } from '../../utils/bcrypt.service';
import { JwtTokenService } from '../../utils/jwt.service';
import { MailService } from '../../utils/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    private bcryptService: BcryptService,
    private jwtService: JwtTokenService,
    private mailService: MailService,
  ) {}

  // ======================== REGISTER ========================
  async register(data: any) {
    const { email, password, name, role } = data;

    if (!email || !password || !name || !role) {
      throw new BadRequestException('Name, email, password, and role are required');
    }

    // Check if email exists in ANY model
    const emailExists = await Promise.all([
      this.adminModel.findOne({ email })  ,
      this.doctorModel.findOne({ email }).select('+password'),
      this.patientModel.findOne({ email }).select('+password'),
    ]);

    if (emailExists.some(user => user)) {
      throw new BadRequestException('Email is already in use');
    }

    let model:any;
    switch (role) {
      case 'admin':
        model = this.adminModel;
        break;
      case 'doctor':
        model = this.doctorModel;
        break;
      case 'patient':
        model = this.patientModel;
        break;
      default:
        throw new BadRequestException('Invalid role');
    }

    const hashedPassword = await this.bcryptService.hash(password);
    const newUser = await model.create({ name, email, password: hashedPassword, role });

    if (role === 'admin') {
      await this.mailService.sendWelcomeMail(email);
    }

const token = this.jwtService.generateToken({
  id: newUser._id.toString(),
  role,
  email,
});
    return {
      message: `${role} registered successfully`,
      data: { user: newUser, token },
    };
  }

  // ======================== LOGIN ========================
  async login(data: { email: string; password: string }) {
    const { email, password } = data;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    // Try to find the user in all models
    let user: any;
    let role: string = '';
    let modelName: string;

    user = await this.adminModel.findOne({ email });

    if (user) {
      role = 'admin';
      modelName = 'Admin';
    } else {
      user = await this.doctorModel.findOne({ email }).select('+password');
      if (user) {
        role = 'doctor';
        modelName = 'Doctor';
      } else {
        user = await this.patientModel.findOne({ email }).select('+password');
        if (user) {
          role = 'patient';
          modelName = 'Patient';
        }
      }
    }

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await this.bcryptService.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.generateToken({ id: user._id.toString(), email,role });

    return {
      message: `logged in successfully`,
      data: { user, token },
    };
  }
}
