import { Response, NextFunction } from "express";
import { IMiddlewareReq } from "./types";
import { IUser } from "../models/User";

type TRoles = IUser["role"][];

export const verifyRoles = (roles: TRoles) => {
  return (req: IMiddlewareReq, res: Response, next: NextFunction) => {
    if (roles.includes(req?.tokenPayload?.role)) {
      next();
    } else {
      res.status(403).json({ error: "Forbidden for this user role" });
    }
  };
};
