import { Module } from '@nestjs/common';
import { FileUploadController } from './file-upload.controller';
import { CloudinaryService } from './cloudinary.service';

@Module({
  controllers: [FileUploadController],
  providers: [CloudinaryService]
})
export class FileUploadModule {}
