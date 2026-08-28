import { Router } from "express";
import { verifyRoles } from "../middlewares/verifyRoles";
import { createUser } from "../controllers/users";

const router = Router();

router.post("/create-user", verifyRoles(["admin"]), createUser);

export default router;
