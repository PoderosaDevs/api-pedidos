import { Router } from "express";
import {
  listarCanais,
  criarCanal,
  atualizarCanal,
  deletarCanal,
  obterCanal
} from "../controllers/canalController";

const router = Router();

router.get("/", listarCanais);
router.get("/:id", obterCanal);
router.post("/", criarCanal);
router.put("/:id", atualizarCanal);
router.delete("/:id", deletarCanal);

export default router;
