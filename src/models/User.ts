import Sequelize, { Model } from 'sequelize';
import { sequelize } from '../services/db';

export interface IUser extends Model {
  email: string;
  password: string;
  role?: 'admin' | 'editor' | 'viewer';
  attempts: number;
  blocked: boolean;
}

const User = sequelize.define<IUser>('User', {
  email: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  role: {
    type: Sequelize.ENUM('admin', 'editor', 'viewer'),
  },
  attempts: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  blocked: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
});

export default User;
