import Sequelize, { Model } from 'sequelize';
import { sequelize } from '../services/db';

export interface IBalance extends Model {
  id: string;
  dateTime: string; //first day of the month at 00:00:00h
  broker: 'IBKR' | 'TASTY';
  calculatedBalance: number; //prev balance plus all P&L of the month
  realBalance: number; //real balance on broker account
  delta: number; // calculatedBalance - realBalance
  comment: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

const Balance = sequelize.define<IBalance>('Balance', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false,
  },
  dateTime: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  broker: {
    type: Sequelize.ENUM('IBKR', 'TASTY'),
    allowNull: false,
  },
  calculatedBalance: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  realBalance: {
    type: Sequelize.FLOAT,
    allowNull: true,
  },
  delta: {
    type: Sequelize.FLOAT,
    allowNull: true,
  },
  comment: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  createdBy: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  updatedBy: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

export default Balance;
