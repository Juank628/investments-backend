import { sequelize } from "./db";

// Import all models to synch
import "../models/User";

export const synchDataBase = () => {
  return sequelize
    .sync()
    .then(() => console.log("db synch"))
    .catch((err) => {
      console.log(err);
      throw err;
    });
};
