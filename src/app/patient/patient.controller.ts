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
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PatientService } from './patient.service';
import { CreatePatientDto, UpdatePatientProfileDto } from './patient.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags("Patients")
@Controller('patient')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}
  // ============== Get own profile (protected) ==============
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getOwnProfile(@Req() req) {
    return this.patientService.findOne(req.user.id);
  }
// signup
  // @Post('signup')
  // signup(@Body() createPatientDto: CreatePatientDto) {
  //   return this.patientService.signup(createPatientDto);
  // }
  
  // CREATE PATIENT
  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientService.create(createPatientDto);
  }
  // GET ALL PATIENTS
  @Get()
  findAll() {
    return this.patientService.findAll();
  }

  // GET SINGLE PATIENT
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientService.findOne(id);
  }

  // ================= OWN PROFILE =================
@Patch('profile')
@UseGuards(JwtAuthGuard)
updateOwnProfile(
  @Req() req,
  @Body() dto: UpdatePatientProfileDto,
) {
  return this.patientService.update(req.user.id, dto);
}


// ================= ADMIN / INTERNAL =================
@Patch(':id')
@UseGuards(JwtAuthGuard) // later add AdminGuard
update(
  @Param('id') id: string,
  @Body() updatePatientDto: UpdatePatientProfileDto,
) {
  return this.patientService.update(id, updatePatientDto);
}


  // SOFT DELETE
  @Patch('soft-delete/:id')
  softDelete(@Param('id') id: string) {
    return this.patientService.softDelete(id);
  }

  // HARD DELETE
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientService.remove(id);
  }

  // UPLOAD PROFILE PICTURE
   @UseGuards(JwtAuthGuard)
  @Post('upload-profile-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/patients',
        filename: (req :any, file, cb) => {
          const uniqueName =
            `patient-${req.user.id}-${Date.now()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
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
    @Req() req:any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File not uploaded');
    }

    return this.patientService.uploadProfilePicture(req.user.id, file);
  }
}
