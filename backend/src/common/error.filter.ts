import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ZodError } from 'zod';

@Catch(ZodError, HttpException, Error)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const data = typeof res === 'string' ? { message: res } : res;

      response.status(exception.getStatus()).json({
        success: false,
        code: exception.getStatus(),
        message: (data as { message: string }).message,
        errors: [
          {
            path: (data as { path: string[] }).path || [],
            message: (data as { message: string }).message,
          },
        ],
      });
    } else if (exception instanceof ZodError) {
      response.status(400).json({
        success: false,
        code: 400,
        errors: exception.issues,
        message: 'validation failed',
      });
    } else {
      response.status(500).json({
        success: false,
        code: 500,
        message: exception.message,
      });
    }
  }
}
