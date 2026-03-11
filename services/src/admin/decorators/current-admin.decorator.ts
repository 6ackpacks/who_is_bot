import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AdminUser {
  id: string;
  username: string;
  role: 'super' | 'normal';
}

export const CurrentAdmin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AdminUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.admin;
  },
);
