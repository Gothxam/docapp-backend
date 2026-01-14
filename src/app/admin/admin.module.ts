import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin, AdminSchema } from '../../schema/admin.schema';
import { BcryptService } from '../../utils/bcrypt.service';
import { JwtTokenService } from '../../utils/jwt.service';
import { MailService } from '../../utils/mail.service';

@Module({
  imports: [
    // Admin Schema
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
    ]),

    // JWT Module
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super_secret_key',
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],

  controllers: [AdminController],

  providers: [
    AdminService,
    BcryptService,
    JwtTokenService,
    MailService,
  ],

  exports: [
    AdminService,
    JwtTokenService,
    BcryptService,
  ],
})
export class AdminModule {}
