import { Request, Response } from 'express';

export const getDiagnostic = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'up',
    timestamp: new Date().toISOString(),
  });
};
