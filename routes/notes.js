import { Router } from "express";
import {
  addStock,
  createNote,
  getNote,
  getNotes,
  renameNote,
  reorderStocks
} from "../services/notes";

const router = Router();

router.get("/notes", getNotes);
router.get("/notes/:note_id", getNote);
router.patch("/notes/:note_id", renameNote);
router.post("/notes", createNote);
router.post("/notes/:note_id/stocks", addStock);
router.patch("/notes/:note_id/reorder", reorderStocks);

export default router;
