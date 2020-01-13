import { Router } from "express";
import { updateProfile } from "../services/settings";

const router = Router();

router.get("/settings", updateProfile);

export default router;
