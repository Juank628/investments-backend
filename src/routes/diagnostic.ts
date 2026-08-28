import { Router } from "express";
import { verifyRoles } from "../middlewares/verifyRoles";
import { getDiagnostic } from "../controllers/diagnostic";

const router: Router = Router();

router.get("/", verifyRoles(["admin", "editor", "viewer"]), getDiagnostic);

export default router;
