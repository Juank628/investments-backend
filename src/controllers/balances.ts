import { Request, Response, NextFunction } from 'express';
import { isLastDayOfMonth, isValid, parse } from 'date-fns';
import { ICreateBalanceBody, IUpdateBalanceBody } from './balances.types';
import { ISO_DATE_REGEX, isMissing } from './helpers';
import Balance from '../models/Balance';
import { IMiddlewareReq } from '../middlewares/types';

const BROKERS = ['IBKR', 'TASTY'];

//strict YYYY-MM-DD parse rejects impossible dates like 2026-02-31
const isMonthEnd = (value: string): boolean => {
  const date = parse(value, 'yyyy-MM-dd', new Date());
  return ISO_DATE_REGEX.test(value) && isValid(date) && isLastDayOfMonth(date);
};

//the PK is (month, broker); a malformed value can't match any row, so it is a 404
const getBalanceKey = (req: Request) => {
  const month = String(req.params.month);
  const broker = String(req.params.broker) as ICreateBalanceBody['broker'];
  const isKeyValid = isMonthEnd(month) && BROKERS.includes(broker);
  return { month, broker, isKeyValid };
};

export const getAllBalances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const balances = await Balance.findAll();
    res.status(200).json(balances);
  } catch (error) {
    next(error);
  }
};

export const getBalanceByKey = async (req: Request, res: Response, next: NextFunction) => {
  const { month, broker, isKeyValid } = getBalanceKey(req);

  if (!isKeyValid) {
    res.status(404).json({ error: 'Balance not found' });
    return;
  }

  try {
    const balance = await Balance.findOne({ where: { month, broker } });

    if (!balance) {
      res.status(404).json({ error: 'Balance not found' });
      return;
    }

    res.status(200).json(balance);
  } catch (error) {
    next(error);
  }
};

export const createBalance = async (req: IMiddlewareReq, res: Response, next: NextFunction) => {
  const { month, broker, calculatedBalance, realBalance, delta, calculatedDetail, comment } =
    req.body as ICreateBalanceBody;

  if (isMissing(month) || isMissing(broker) || isMissing(calculatedBalance)) {
    res.status(422).json({
      error: 'Missing required parameters',
      details: {
        month: isMissing(month) ? 'month is required' : undefined,
        broker: isMissing(broker) ? 'broker is required' : undefined,
        calculatedBalance: isMissing(calculatedBalance)
          ? 'calculatedBalance is required'
          : undefined,
      },
    });
    return;
  }

  const isMonthInvalid = !isMonthEnd(String(month));
  const isBrokerInvalid = !BROKERS.includes(broker);

  if (isMonthInvalid || isBrokerInvalid) {
    res.status(422).json({
      error: 'Invalid parameters',
      details: {
        month: isMonthInvalid ? 'month must be the last day of a month (YYYY-MM-DD)' : undefined,
        broker: isBrokerInvalid ? `broker must be one of ${BROKERS.join(', ')}` : undefined,
      },
    });
    return;
  }

  try {
    const existing = await Balance.findOne({ where: { month, broker } });

    if (existing) {
      res.status(409).json({ error: 'Balance already exists for this month and broker' });
      return;
    }

    const balance = await Balance.create({
      month,
      broker,
      calculatedBalance,
      realBalance,
      delta,
      calculatedDetail,
      comment,
      createdBy: req.tokenPayload?.email,
      updatedBy: req.tokenPayload?.email,
    });
    res.status(201).json(balance);
  } catch (error) {
    next(error);
  }
};

export const updateBalance = async (req: IMiddlewareReq, res: Response, next: NextFunction) => {
  const { month, broker, isKeyValid } = getBalanceKey(req);
  //only non-PK fields can change; month/broker identify the row
  const { calculatedBalance, realBalance, delta, calculatedDetail, comment } =
    req.body as IUpdateBalanceBody;

  if (!isKeyValid) {
    res.status(404).json({ error: 'Balance not found' });
    return;
  }

  try {
    const balance = await Balance.findOne({ where: { month, broker } });

    if (!balance) {
      res.status(404).json({ error: 'Balance not found' });
      return;
    }

    //drop omitted fields, otherwise Sequelize would set them to NULL
    const changes = Object.fromEntries(
      Object.entries({ calculatedBalance, realBalance, delta, calculatedDetail, comment }).filter(
        ([, value]) => value !== undefined
      )
    );

    await balance.update({ ...changes, updatedBy: req.tokenPayload?.email });
    res.status(200).json(balance);
  } catch (error) {
    next(error);
  }
};

export const deleteBalance = async (req: Request, res: Response, next: NextFunction) => {
  const { month, broker, isKeyValid } = getBalanceKey(req);

  if (!isKeyValid) {
    res.status(404).json({ error: 'Balance not found' });
    return;
  }

  try {
    const balance = await Balance.findOne({ where: { month, broker } });

    if (!balance) {
      res.status(404).json({ error: 'Balance not found' });
      return;
    }

    await balance.destroy();
    res.status(200).json({ message: 'Balance deleted successfully' });
  } catch (error) {
    next(error);
  }
};
