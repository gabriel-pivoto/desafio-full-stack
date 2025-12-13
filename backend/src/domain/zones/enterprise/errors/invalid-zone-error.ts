import { UseCaseError } from '@/core/errors/use-case-error';

export class InvalidZoneError extends Error implements UseCaseError {
  constructor(message: string) {
    super(message);
  }
}
