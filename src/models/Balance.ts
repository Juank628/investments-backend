import Sequelize, { Model } from 'sequelize';
import { sequelize } from '../services/db';

export interface IBalance extends Model {
  month: string; //last day of the month (YYYY-MM-DD), one row per month and broker
  broker: 'IBKR' | 'TASTY';
  calculatedBalance: number; //prev balance plus all P&L of the month
  realBalance: number; //real balance on broker account
  delta: number; // calculatedBalance - realBalance
  calculatedDetail: Record<string, unknown> | null; // generic breakdown of calculatedBalance
  comment: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

const Balance = sequelize.define<IBalance>('Balance', {
  month: {
    type: Sequelize.DATEONLY,
    primaryKey: true,
    allowNull: false,
  },
  broker: {
    type: Sequelize.ENUM('IBKR', 'TASTY'),
    primaryKey: true,
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
  calculatedDetail: {
    type: Sequelize.JSON,
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
