import { BadRequestException } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const BLOCKED = new Set(['__proto__', 'constructor', 'prototype']);

function hasBlockedKey(value: unknown, depth = 0): boolean {
  if (typeof value !== 'object' || value === null || depth > 8) return false;
  if (Array.isArray(value)) return value.some((item) => hasBlockedKey(item, depth + 1));
  return Object.keys(value).some((key) => BLOCKED.has(key) || hasBlockedKey((value as Record<string, unknown>)[key], depth + 1));
}

// Request bodies and queries never need these keys, so they are refused outright.
export function rejectPrototypeKeys(req: Request, _res: Response, next: NextFunction): void {
  if (hasBlockedKey(req.body) || hasBlockedKey(req.query)) {
    next(new BadRequestException('Unexpected key'));
    return;
  }
  next();
}
