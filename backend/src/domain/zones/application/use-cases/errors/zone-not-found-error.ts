import { UseCaseError } from '@/core/errors/use-case-error';

export class ZoneNotFoundError extends Error implements UseCaseError {
  constructor(id: string) {
    super(`Zone with id "${id}" not found`);
  }
}
