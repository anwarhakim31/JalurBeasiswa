import { Body, Controller, Delete, HttpException } from '@nestjs/common';
import cloudinary from '../config/cloudinary';

@Controller('/api/photo')
export class PhotoController {
  constructor() {}

  @Delete('/destroy')
  async deleteImage(@Body('image_url') image_url: string) {
    if (!image_url) {
      throw new HttpException('url gambar tidak ditemukan', 404);
    }
    console.log(image_url);
    const publicId = image_url.split('/').slice(7, 10).join('/').split('.')[0];

    if (!publicId) {
      throw new HttpException('public_id gambar tidak ditemukan', 404);
    }

    const res = await cloudinary.uploader.destroy(publicId);

    return {
      success: true,
      message: 'Berhasil menghapus foto',
      code: 200,
      data: res,
    };
  }
}
