import { Router } from "express";
import { getUsers, updateUser } from "../services/users";

const router = Router();

router.get("/users", getUsers);
router.patch("/users", updateUser);

export default router;
