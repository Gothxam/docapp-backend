import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule} from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './app/admin/admin.module';
import { DoctorModule } from './app/doctor/doctor.module';
import { PatientModule } from './app/patient/patient.module';
import { ReviewModule } from './app/review/review.module';
import { AuthModule } from './app/auth/auth.module';
import { AppointmentModule } from './app/appointment/appointment.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    AdminModule,
    DoctorModule,
    PatientModule,
    AuthModule,
    ReviewModule,
    AppointmentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
