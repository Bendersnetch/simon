import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class HttpErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err.isAxiosError) {
          const axiosErr = err as AxiosError;
          throw new HttpException(
            axiosErr.response?.data || 'Unknown error',
            axiosErr.response?.status || 500,
          );
        }
        throw err;
      }),
    );
  }
}
