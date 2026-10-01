import Sequelize, { Model } from 'sequelize';
import { sequelize } from '../services/db';

export interface IVerticalSpread extends Model {
  id: string;
  ticker: string;
  openDateTime: string;
  dayType: 'normal' | 'gap too hight' | 'risk event';
  maxGapFirst15min: number;
  priceAtOpen: number;
  straddleAtOpen: number;
  strategy: 'bearCallSpread' | 'bullPutSpread';
  strike: number;
  width: number;
  delta: number;
  credit: number;
  dte: number; //days to expire
  closeDateTime: string;
  priceAtClose: number;
  netProfitLoss: number; //broker's profit/loss after comissions
}

const VerticalSpread = sequelize.define<IVerticalSpread>('VerticalSpread', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false,
  },
  ticker: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  openDateTime: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  dayType: {
    type: Sequelize.ENUM('normal', 'gap too hight', 'risk event'),
    allowNull: false,
  },
  maxGapFirst15min: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  priceAtOpen: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  straddleAtOpen: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  strategy: {
    type: Sequelize.ENUM('bearCallSpread', 'bullPutSpread'),
    allowNull: false,
  },
  strike: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  width: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  delta: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  credit: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  dte: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  closeDateTime: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  priceAtClose: {
    type: Sequelize.FLOAT,
    allowNull: true,
  },
  netProfitLoss: {
    type: Sequelize.FLOAT,
    allowNull: true,
  },
});

export default VerticalSpread;
