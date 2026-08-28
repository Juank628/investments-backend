import "dotenv/config";
import { synchDataBase } from "../services/synch";

synchDataBase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
