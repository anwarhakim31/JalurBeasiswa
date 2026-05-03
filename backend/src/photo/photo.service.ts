import { Injectable, HttpException } from '@nestjs/common';
import cloudinary from '../config/cloudinary';

@Injectable()
export class PhotoService {
  constructor() {}
  async destroy(image_url: string) {
    if (!image_url) {
      throw new HttpException('url gambar tidak ditemukan', 404);
    }

    const publicId = image_url.split('/').slice(7, 10).join('/').split('.')[0];

    if (!publicId) {
      throw new HttpException('public_id gambar tidak ditemukan', 404);
    }

    return await cloudinary.uploader.destroy(publicId);
  }
}
