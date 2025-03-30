// Generate service for Cloudinary
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from 'src/config/constants';


@Injectable()
export class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: CLOUDINARY_CLOUD_NAME,
            api_key: CLOUDINARY_API_KEY,
            api_secret: CLOUDINARY_API_SECRET,
        });
    }

    async uploadImage(
        file: Express.Multer.File,
        options,
    ) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
            ...options,
        });
        return { secure_url, public_id };
    }

    async deleteImage(public_id: string): Promise<void> {
        await cloudinary.uploader.destroy(public_id);
    }

    async uploadImageFromUrl(
        url: string,
        options,
    ) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(url, {
            ...options,
        });
        return { secure_url, public_id };
    }


}