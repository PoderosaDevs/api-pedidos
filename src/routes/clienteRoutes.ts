import { Router } from "express";
import {
  listarClientes,
  criarCliente,
  atualizarCliente,
  deletarCliente,
} from "../controllers/clienteController";
import { autenticar } from "../middlewares/auth";

const router = Router();

// protege todas as rotas abaixo
router.use(autenticar);

router.get("/", listarClientes);
router.post("/register", criarCliente);
router.put("/:id", atualizarCliente);
router.delete("/:id", deletarCliente);

export default router;
