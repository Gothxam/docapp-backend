import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Admin, AdminSchema } from 'src/schema/admin.schema';
import { Doctor, DoctorSchema } from 'src/schema/doctor.schema';
import { Patient, PatientSchema } from 'src/schema/patient.schema';
import {BcryptService} from "../../utils/bcrypt.service";
import {JwtTokenService} from "../../utils/jwt.service";
import {MailService} from "../../utils/mail.service"



@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: ((process.env.JWT_SECRET || 'secret123').toString().replace(/^"|"$/g, '')).replace(/;$/g, ''),
      signOptions: { expiresIn: '1d' },
    }),
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService,MailService,JwtTokenService,BcryptService],
})
export class AuthModule { }
