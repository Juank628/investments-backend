import { Response, NextFunction } from 'express';
import { IMiddlewareReq } from './types';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const getTokenPayload = (req: IMiddlewareReq, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const tokenPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY!) as JwtPayload;
    req.tokenPayload = tokenPayload;
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  next();
};
