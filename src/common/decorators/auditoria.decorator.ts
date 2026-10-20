import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const Auditoria = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return {
    usuarioId: req.user?.id,
    ipAddress: req.ip,
  };
});
