import "dotenv/config";
import bcrypt from "bcryptjs";
import { synchDataBase } from "../services/synch";
import User from "../models/User";

const SEED_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
const SEED_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

const seed = async () => {
  if (!SEED_PASSWORD) {
    console.error("SEED_ADMIN_PASSWORD is not set in .env");
    process.exit(1);
  }

  await synchDataBase();

  const existing = await User.findOne({ where: { email: SEED_EMAIL } });
  if (existing) {
    console.log(`Admin user ${SEED_EMAIL} already exists`);
    process.exit(0);
  }

  const encryptedPassword = await bcrypt.hash(SEED_PASSWORD, 10);
  await User.create({
    email: SEED_EMAIL,
    password: encryptedPassword,
    role: "admin",
  });

  console.log(`Seeded admin user: ${SEED_EMAIL}`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
