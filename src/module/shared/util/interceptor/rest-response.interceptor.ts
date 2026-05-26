import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class RestResponseInterceptor<
  T extends object,
> implements NestInterceptor<any, T> {
  constructor(private readonly dto: new () => T) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<T> {
    return next.handle().pipe(
      switchMap(async (data) => {
        const plainData = instanceToPlain(data);
        if (Array.isArray(plainData)) {
          const transformedList = plainToInstance(this.dto, plainData, {
            excludeExtraneousValues: true,
          });
          const validationResults = await Promise.all(
            transformedList.map((item) => validate(item)),
          );
          const errors = validationResults.flat();
          if (errors.length > 0) {
            throw new BadRequestException({
              message: 'Response validation failed',
              errors,
            });
          }
          return transformedList as T;
        }

        const transformedData = plainToInstance(this.dto, plainData, {
          excludeExtraneousValues: true,
        });
        const errors = await validate(transformedData);
        if (errors.length > 0) {
          throw new BadRequestException({
            message: 'Response validation failed',
            errors,
          });
        }
        return transformedData;
      }),
    );
  }
}
