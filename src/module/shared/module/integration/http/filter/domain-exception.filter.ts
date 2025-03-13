import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { AlreadyExists } from '@sharedModule/core/exception/already-exists.exception';
import { InsufficientPermissionException } from '@sharedModule/core/exception/insufficient-permission.exception';
import { NotFoundException } from '@sharedModule/core/exception/not-found.exception';
import { UnauthorizedException } from '@sharedModule/core/exception/unauthorized.exception';

import { Response } from 'express';

@Catch(
  UnauthorizedException,
  InsufficientPermissionException,
  NotFoundException,
  AlreadyExists,
)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.BAD_REQUEST;

    if (exception instanceof UnauthorizedException) {
      statusCode = HttpStatus.UNAUTHORIZED;
    }

    if (exception instanceof InsufficientPermissionException) {
      statusCode = HttpStatus.FORBIDDEN;
    }

    if (exception instanceof NotFoundException) {
      statusCode = HttpStatus.NOT_FOUND;
    }
    if (exception instanceof AlreadyExists) {
      statusCode = HttpStatus.CONFLICT;
    }

    response.status(statusCode).json({
      statusCode,
      error: exception.name,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
