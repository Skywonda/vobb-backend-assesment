import { Request, Response, RequestHandler } from 'express';

export interface AuthUser {
  id: string;
  type: 'manager' | 'customer';
}

export interface AuthenticatedRequest<P = {}, ResBody = any, ReqBody = any> extends Request<P, ResBody, ReqBody> {
  user: AuthUser;
}

export type AuthRequestHandler = RequestHandler<any, any, any, any, { user: AuthUser }>;

export function asHandler<P = {}, ResBody = any, ReqBody = any>(
  handler: (req: Request<P, ResBody, ReqBody>, res: Response) => Promise<void>
): RequestHandler;
export function asHandler<P = {}, ResBody = any, ReqBody = any>(
  handler: (req: AuthenticatedRequest<P, ResBody, ReqBody>, res: Response) => Promise<void>
): RequestHandler;
export function asHandler<P = {}, ResBody = any, ReqBody = any>(
  handler: (req: any, res: Response) => Promise<void>
): RequestHandler {
  return handler as RequestHandler;
}