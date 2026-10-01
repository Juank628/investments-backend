import Sequelize, { Model } from 'sequelize';
import { sequelize } from '../services/db';
import User from './User';

export interface IMovement extends Model {
  id: string;
  dateTime: string;
  broker: 'IBKR' | 'TASTY';
  amount: number;
  description: string;
  userId: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

const Movement = sequelize.define<IMovement>('Movement', {
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
  amount: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userId: {
    type: Sequelize.STRING,
    allowNull: false,
    references: {
      model: User,
      key: 'email',
    },
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

User.hasMany(Movement, { foreignKey: 'userId', sourceKey: 'email' });
Movement.belongsTo(User, { foreignKey: 'userId', targetKey: 'email' });

export default Movement;
