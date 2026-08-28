import "dotenv/config";
import User from "../models/User";

const SEED_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@example.com";

const unseed = async () => {
  const deleted = await User.destroy({ where: { email: SEED_EMAIL } });
  console.log(
    deleted
      ? `Removed seed user ${SEED_EMAIL}`
      : `No seed user ${SEED_EMAIL} found`,
  );
  process.exit(0);
};

unseed().catch((err) => {
  console.error(err);
  process.exit(1);
});
