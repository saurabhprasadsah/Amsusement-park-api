import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { diskStorage } from 'multer';
import * as path from 'path';


@Controller('file-upload')
export class FileUploadController {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    // File upload endpoint


    @Post('image')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',  // Destination folder
                filename: (req, file, cb) => {
                    const filename = `${Date.now()}-${file.originalname}`;
                    cb(null, filename);  // Save with timestamp
                },
            }),
            fileFilter: (req, file, cb) => {
                // Allow only image files
                const fileTypes = /jpeg|jpg|png|gif/;
                const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
                const mimetype = fileTypes.test(file.mimetype);

                if (extname && mimetype) {
                    return cb(null, true); // File is allowed
                } else {
                    return cb(new Error('Only image files are allowed!'), false); // Reject file
                }
            },
        })
    )

    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            return { message: 'No file uploaded' };
        }
        try {
            const uploadResult = await this.cloudinaryService.uploadImage(file, {});
            return { message: 'File uploaded successfully', data: uploadResult };
        } catch (error) {
            return { message: 'File upload failed', error: error.message };
        }
    }

    // Delete file endpoint
    @Post('delete')
    async deleteFile(@Body('publicId') publicId: string) {
        try {
            await this.cloudinaryService.deleteImage(publicId);
            return { message: 'File deleted successfully' };
        } catch (error) {
            return { message: 'File deletion failed', error: error.message };
        }
    }

    // Upload file from URL endpoint
    @Post('upload-url')
    async uploadFileFromUrl(@Body('url') url: string) {
        try {
            const uploadResult = await this.cloudinaryService.uploadImageFromUrl(url, {});
            return { message: 'File uploaded from URL successfully', data: uploadResult };
        } catch (error) {
            return { message: 'File upload from URL failed', error: error.message };
        }
    }
}