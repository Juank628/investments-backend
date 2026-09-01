import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { ICreateMovementBody, IUpdateMovementBody } from './movements.types';
import { UUID_REGEX, isMissing } from './helpers';
import Movement from '../models/Movement';
import { IMiddlewareReq } from '../middlewares/types';

export const getAllMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movements = await Movement.findAll();
    res.status(200).json(movements);
  } catch (error) {
    next(error);
  }
};

export const getMovementById = async (req: Request, res: Response, next: NextFunction) => {
  const id = String(req.params.id);

  if (!UUID_REGEX.test(id)) {
    res.status(404).json({ error: 'Movement not found' });
    return;
  }

  try {
    const movement = await Movement.findOne({ where: { id } });

    if (!movement) {
      res.status(404).json({ error: 'Movement not found' });
      return;
    }

    res.status(200).json(movement);
  } catch (error) {
    next(error);
  }
};

export const createMovement = async (req: IMiddlewareReq, res: Response, next: NextFunction) => {
  const { dateTime, broker, amount, description, userId } = req.body as ICreateMovementBody;

  if (
    isMissing(dateTime) ||
    isMissing(broker) ||
    isMissing(amount) ||
    isMissing(description) ||
    isMissing(userId)
  ) {
    res.status(422).json({
      error: 'Missing required parameters',
      details: {
        dateTime: isMissing(dateTime) ? 'dateTime is required' : undefined,
        broker: isMissing(broker) ? 'broker is required' : undefined,
        amount: isMissing(amount) ? 'amount is required' : undefined,
        description: isMissing(description) ? 'description is required' : undefined,
        userId: isMissing(userId) ? 'userId is required' : undefined,
      },
    });
    return;
  }

  try {
    const movement = await Movement.create({
      id: randomUUID(),
      dateTime,
      broker,
      amount,
      description,
      userId,
      createdBy: req.tokenPayload?.email,
      updatedBy: req.tokenPayload?.email,
    });
    res.status(201).json(movement);
  } catch (error) {
    next(error);
  }
};

export const updateMovement = async (req: IMiddlewareReq, res: Response, next: NextFunction) => {
  const id = String(req.params.id);
  const body = req.body as IUpdateMovementBody;

  if (!UUID_REGEX.test(id)) {
    res.status(404).json({ error: 'Movement not found' });
    return;
  }

  try {
    const movement = await Movement.findOne({ where: { id } });

    if (!movement) {
      res.status(404).json({ error: 'Movement not found' });
      return;
    }

    await movement.update({ ...body, updatedBy: req.tokenPayload?.email });
    res.status(200).json(movement);
  } catch (error) {
    next(error);
  }
};

export const deleteMovement = async (req: Request, res: Response, next: NextFunction) => {
  const id = String(req.params.id);

  if (!UUID_REGEX.test(id)) {
    res.status(404).json({ error: 'Movement not found' });
    return;
  }

  try {
    const movement = await Movement.findOne({ where: { id } });

    if (!movement) {
      res.status(404).json({ error: 'Movement not found' });
      return;
    }

    await movement.destroy();
    res.status(200).json({ message: 'Movement deleted successfully' });
  } catch (error) {
    next(error);
  }
};
