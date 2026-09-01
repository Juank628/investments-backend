import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { ICreateVerticalSpreadBody, IUpdateVerticalSpreadBody } from './verticalSpreads.types';
import { UUID_REGEX, isMissing } from './helpers';
import VerticalSpread from '../models/VerticalSpread';
import { IMiddlewareReq } from '../middlewares/types';

export const getAllVerticalSpreads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const verticalSpreads = await VerticalSpread.findAll();
    res.status(200).json(verticalSpreads);
  } catch (error) {
    next(error);
  }
};

export const getVerticalSpreadById = async (req: Request, res: Response, next: NextFunction) => {
  const id = String(req.params.id);

  if (!UUID_REGEX.test(id)) {
    res.status(404).json({ error: 'VerticalSpread not found' });
    return;
  }

  try {
    const verticalSpread = await VerticalSpread.findOne({ where: { id } });

    if (!verticalSpread) {
      res.status(404).json({ error: 'VerticalSpread not found' });
      return;
    }

    res.status(200).json(verticalSpread);
  } catch (error) {
    next(error);
  }
};

export const createVerticalSpread = async (req: IMiddlewareReq, res: Response, next: NextFunction) => {
  const {
    ticker,
    openDateTime,
    dayType,
    maxGapFirst15min,
    priceAtOpen,
    straddleAtOpen,
    strategy,
    strike,
    width,
    delta,
    credit,
    dte,
    closeDateTime,
    priceAtClose,
    netProfitLoss,
  } = req.body as ICreateVerticalSpreadBody;

  if (
    isMissing(ticker) ||
    isMissing(openDateTime) ||
    isMissing(dayType) ||
    isMissing(maxGapFirst15min) ||
    isMissing(priceAtOpen) ||
    isMissing(straddleAtOpen) ||
    isMissing(strategy) ||
    isMissing(strike) ||
    isMissing(width) ||
    isMissing(delta) ||
    isMissing(credit) ||
    isMissing(dte)
  ) {
    res.status(422).json({
      error: 'Missing required parameters',
      details: {
        ticker: isMissing(ticker) ? 'ticker is required' : undefined,
        openDateTime: isMissing(openDateTime) ? 'openDateTime is required' : undefined,
        dayType: isMissing(dayType) ? 'dayType is required' : undefined,
        maxGapFirst15min: isMissing(maxGapFirst15min) ? 'maxGapFirst15min is required' : undefined,
        priceAtOpen: isMissing(priceAtOpen) ? 'priceAtOpen is required' : undefined,
        straddleAtOpen: isMissing(straddleAtOpen) ? 'straddleAtOpen is required' : undefined,
        strategy: isMissing(strategy) ? 'strategy is required' : undefined,
        strike: isMissing(strike) ? 'strike is required' : undefined,
        width: isMissing(width) ? 'width is required' : undefined,
        delta: isMissing(delta) ? 'delta is required' : undefined,
        credit: isMissing(credit) ? 'credit is required' : undefined,
        dte: isMissing(dte) ? 'dte is required' : undefined,
      },
    });
    return;
  }

  try {
    const verticalSpread = await VerticalSpread.create({
      id: randomUUID(),
      ticker,
      openDateTime,
      dayType,
      maxGapFirst15min,
      priceAtOpen,
      straddleAtOpen,
      strategy,
      strike,
      width,
      delta,
      credit,
      dte,
      closeDateTime,
      priceAtClose,
      netProfitLoss,
      createdBy: req.tokenPayload?.email,
      updatedBy: req.tokenPayload?.email,
    });
    res.status(201).json(verticalSpread);
  } catch (error) {
    next(error);
  }
};

export const updateVerticalSpread = async (req: IMiddlewareReq, res: Response, next: NextFunction) => {
  const id = String(req.params.id);
  const body = req.body as IUpdateVerticalSpreadBody;

  if (!UUID_REGEX.test(id)) {
    res.status(404).json({ error: 'VerticalSpread not found' });
    return;
  }

  try {
    const verticalSpread = await VerticalSpread.findOne({ where: { id } });

    if (!verticalSpread) {
      res.status(404).json({ error: 'VerticalSpread not found' });
      return;
    }

    await verticalSpread.update({ ...body, updatedBy: req.tokenPayload?.email });
    res.status(200).json(verticalSpread);
  } catch (error) {
    next(error);
  }
};

export const deleteVerticalSpread = async (req: Request, res: Response, next: NextFunction) => {
  const id = String(req.params.id);

  if (!UUID_REGEX.test(id)) {
    res.status(404).json({ error: 'VerticalSpread not found' });
    return;
  }

  try {
    const verticalSpread = await VerticalSpread.findOne({ where: { id } });

    if (!verticalSpread) {
      res.status(404).json({ error: 'VerticalSpread not found' });
      return;
    }

    await verticalSpread.destroy();
    res.status(200).json({ message: 'VerticalSpread deleted successfully' });
  } catch (error) {
    next(error);
  }
};
