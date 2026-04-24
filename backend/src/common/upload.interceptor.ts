import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

export const UploadInterceptor = (fieldName: string, folder: string) => {
  return FileInterceptor(fieldName, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const NIM = req.body.nim || 'anonymous';

        const uploadPath = join(process.cwd(), 'uploads', folder, NIM);

        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
      },

      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);

        cb(null, `${fieldName}-${unique}${extname(file.originalname)}`);
      },
    }),

    limits: {
      fileSize: 2 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return cb(new Error('Hanya file gambar!'), false);
      }
      cb(null, true);
    },
  });
};
