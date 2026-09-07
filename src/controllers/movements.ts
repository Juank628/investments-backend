import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import { Request, Response, NextFunction } from 'express';
import { ICreateMovementBody, IGetAllMovementsQuery, IUpdateMovementBody } from './movements.types';
import { ISO_DATE_REGEX, UUID_REGEX, isMissing } from './helpers';
import Movement from '../models/Movement';
import { IMiddlewareReq } from '../middlewares/types';

export const getAllMovements = async (req: Request, res: Response, next: NextFunction) => {
  const { fromDate, toDate } = req.query as IGetAllMovementsQuery;

  const isFromDateInvalid = !isMissing(fromDate) && !ISO_DATE_REGEX.test(String(fromDate));
  const isToDateInvalid = !isMissing(toDate) && !ISO_DATE_REGEX.test(String(toDate));

  if (isFromDateInvalid || isToDateInvalid) {
    res.status(422).json({
      error: 'Invalid query parameters',
      details: {
        fromDate: isFromDateInvalid ? 'fromDate must be an ISO 8601 date (YYYY-MM-DD)' : undefined,
        toDate: isToDateInvalid ? 'toDate must be an ISO 8601 date (YYYY-MM-DD)' : undefined,
      },
    });
    return;
  }

  try {
    const where: Record<string, unknown> = {};

    if (!isMissing(fromDate) || !isMissing(toDate)) {
      where.dateTime = {
        ...(!isMissing(fromDate) && { [Op.gte]: `${fromDate}T00:00:00.000Z` }),
        ...(!isMissing(toDate) && { [Op.lte]: `${toDate}T23:59:59.999Z` }),
      };
    }

    const movements = await Movement.findAll({ where });
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
