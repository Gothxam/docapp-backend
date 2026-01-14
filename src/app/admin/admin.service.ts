import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from '../../schema/admin.schema';
import { CreateAdminDto,UpdateAdminDto } from './admin.dto'
import { BcryptService } from '../../utils/bcrypt.service';
import { JwtTokenService } from '../../utils/jwt.service';
import { MailService } from '../../utils/mail.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private bcryptService: BcryptService,
    private jwtService: JwtTokenService,
    private mailService: MailService,
  ) {}

  async create(dto: CreateAdminDto) {
    const hashedPassword = await this.bcryptService.hash(dto.password);

    const admin = await this.adminModel.create({
      ...dto,
      password: hashedPassword,
    });

    await this.mailService.sendWelcomeMail(admin.email);

    const token = this.jwtService.generateToken({
      id: admin._id,
      role: admin.role,
    });

    return { admin, token };
  }

  async findAll() {
    return this.adminModel.find().select('-password');
  }

  async findOne(id: string) {
    const admin = await this.adminModel.findById(id).select('-password');
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async update(id: string, dto: UpdateAdminDto) {
    if (dto.password) {
      dto.password = await this.bcryptService.hash(dto.password);
    }

    const admin = await this.adminModel.findByIdAndUpdate(id, dto, {
      new: true,
    }).select('-password');

    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async remove(id: string) {
    const admin = await this.adminModel.findByIdAndDelete(id);
    if (!admin) throw new NotFoundException('Admin not found');
    return { message: 'Admin deleted successfully' };
  }
}
