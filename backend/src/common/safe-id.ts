import { BadRequestException } from '@nestjs/common';

const SAFE_ID = /^[a-z0-9_-]{1,64}$/;

// Route params and ids must be a plain lowercase string before they touch any lookup.
export function safeId(value: unknown, label = 'id'): string {
  if (typeof value !== 'string' || !SAFE_ID.test(value)) {
    throw new BadRequestException(`Invalid ${label}`);
  }
  return value;
}
