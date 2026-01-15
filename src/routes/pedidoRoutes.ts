import { Router } from "express";
import {
  criarPedido,
  listarPedidos,
  listarPedidosSummary,
  obterPedido,
  atualizarPedido,
  excluirPedido,
  adicionarAtualizacao,
  finalizarPedido,
} from "../controllers/pedidoController";

const router = Router();

// ✅ Criar pedido
router.post("/register", criarPedido);

// ✅ Summary de pedidos (IMPORTANTE: antes do /:id)
router.get("/summary", listarPedidosSummary);

// ✅ Listar todos
router.get("/", listarPedidos);

// ✅ Obter um pedido específico
router.get("/:id", obterPedido);

// ✅ Atualizar pedido
router.put("/:id", atualizarPedido);

// ✅ Excluir pedido
router.delete("/:id", excluirPedido);

// 👉 Adicionar atualização (histórico)
router.post("/:id/atualizacoes", adicionarAtualizacao);

// 👉 Finalizar pedido
router.post("/:id/finalizar", finalizarPedido);

export default router;
