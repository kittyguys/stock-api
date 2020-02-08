import { Router } from "express";
import {
  getStocks,
  createStock,
  addStock,
  deleteStock,
  reorderStock
} from "../services/stocks";

const router = Router();

router.get("/stocks", getStocks);
router.post("/stocks", createStock);
router.patch("/stocks", addStock);
router.delete("/stocks", deleteStock);
router.patch("/stocks/reorder", reorderStock);

export default router;
