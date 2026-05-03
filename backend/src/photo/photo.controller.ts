import { Body, Controller, Delete } from '@nestjs/common';
import { PhotoService } from './photo.service';

@Controller('/api/photo')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Delete('/destroy')
  async deleteImage(@Body('image_url') imageUrl: string) {
    const data = await this.photoService.destroy(imageUrl);

    return {
      success: true,
      code: 200,
      data,
    };
  }
}
