import { Router } from "express";
import {
  getStocks,
  createStock,
  addStock,
  reorderStock
} from "../services/stocks";

const router = Router();

router.get("/stocks", getStocks);
router.post("/stocks", createStock);
router.patch("/stocks", addStock);
router.patch("/stocks/reorder", reorderStock);

export default router;
