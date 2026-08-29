import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface IMiddlewareReq extends Request {
  tokenPayload?: JwtPayload;
}
