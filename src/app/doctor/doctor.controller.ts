import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UsePipes,
  ValidationPipe,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

import { DoctorService } from './doctor.service';
import {
  CreateDoctorDto,
  UpdateDoctorAdminDto,
  UpdateDoctorProfileDto,
} from './doctor.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { memoryStorage } from 'multer';
import type { Express } from 'express';

@ApiTags('Doctor')
@Controller('doctor')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  // ================= SIGNUP =================
  @Post()
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.create(createDoctorDto);
  }

  // ================= READ =================
  @Get()
  findAll() {
    return this.doctorService.findAll();
  }
  // ================get profile==============
  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getOwnProfile(@Req() req) {
    console.log('REQ.USER:', req.user);
    try {
      console.log('REQ.USER.id type:', typeof req.user?.id, 'value:', req.user?.id);
    } catch (e) {
      console.error('Error reading req.user.id', e);
    }
    return this.doctorService.findOne(req.user.id);
  }
// ================= DOCTOR PROFILE UPDATE =================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateOwnProfile(
    @Req() req,
    @Body() updateDoctorDto: UpdateDoctorProfileDto,
  ) {
console.log('DTO BODY:', updateDoctorDto)

    return this.doctorService.updateProfile(req.user.id, updateDoctorDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }
  // ================= ADMIN UPDATE =================
  @Patch(':id')
  updateByAdmin(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateDoctorAdminDto,
  ) {
    return this.doctorService.update(id, updateDoctorDto);
  }

  
  // ================= SOFT DELETE =================
  @Patch('soft-delete/:id')
  softDelete(@Param('id') id: string) {
    return this.doctorService.softDelete(id);
  }

  // ================= HARD DELETE =================
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorService.remove(id);
  }

  // ================= PROFILE PICTURE =================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('upload-profile-picture')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload profile picture (JPG/PNG, max 2MB)',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture file (JPG/PNG)',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(new BadRequestException('Only JPG/PNG allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadProfilePicture(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('📤 Doctor upload endpoint hit');
    console.log('File object:', {
      fieldname: file?.fieldname,
      originalname: file?.originalname,
      hasBuffer: !!file?.buffer,
      destination: (file as any)?.destination,
      filename: (file as any)?.filename,
    });

    if (!file) {
      throw new BadRequestException('File not uploaded');
    }

    return this.doctorService.uploadProfilePicture(req.user.id, file);
  }

}