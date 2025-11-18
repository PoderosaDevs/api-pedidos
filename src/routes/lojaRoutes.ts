import { Router } from "express";
import {
  listarLojas,
  criarLoja,
  atualizarLoja,
  deletarLoja,
  obterLoja
} from "../controllers/lojaController";

const router = Router();

router.get("/", listarLojas);
router.get("/:id", obterLoja);
router.post("/", criarLoja);
router.put("/:id", atualizarLoja);
router.delete("/:id", deletarLoja);

export default router;
