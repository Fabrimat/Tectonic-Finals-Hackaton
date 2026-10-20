import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';
import { Request } from 'express';
import { loadConfig } from '../config/config';

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly expected = digest(loadConfig().partnerApiKey);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.header('x-api-key');
    if (!provided || !timingSafeEqual(digest(provided), this.expected)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
