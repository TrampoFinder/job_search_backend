import { Injectable } from '@nestjs/common';
import {
  PersistenceClientException,
  PersistenceInternalException,
} from './exception/storage.exception';
import { Prisma } from '@prisma/client';

@Injectable()
export abstract class DefaultPrismaRepository {
  protected cleanParams = <T extends Record<string, any>>(params: T): T => {
    return Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null),
    ) as T;
  };
  protected handleAndThrowError(error: unknown): never {
    const errorMessage = this.extractErrorMessage(error);
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new PersistenceClientException(error.message);
    }

    throw new PersistenceInternalException(errorMessage);
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return 'An unexpected error occurred.';
  }
}
