import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { Doctor, DoctorSchema } from '../../schema/doctor.schema';
import { JwtStrategy } from '../auth/jwt.strategy'; // make sure path is correct

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Doctor.name, schema: DoctorSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: ((process.env.JWT_SECRET || 'secret123').toString().replace(/^"|"$/g, '')).replace(/;$/g, ''),
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [DoctorController],
  providers: [DoctorService, JwtStrategy],
  exports: [DoctorService],
})
export class DoctorModule {}
