import { Router } from "express";
import { signup, signin } from "../services/auth";

const router = Router();

router.post("/auth/signup", signup);
router.post("/auth/signin", signin);

export default router;
