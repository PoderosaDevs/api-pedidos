import { Router } from "express";
import {
  criarPedido,
  listarPedidos,
  obterPedido,
  atualizarPedido,
  excluirPedido,
  adicionarAtualizacao,
  finalizarPedido,
} from "../controllers/pedidoController";

const router = Router();

// Criar pedido
router.post("/register", criarPedido);

// Listar todos
router.get("/", listarPedidos);

// Obter um pedido específico
router.get("/:id", obterPedido);

// Atualizar pedido (campos gerais, inclusive resolução se quiser via PUT)
router.put("/:id", atualizarPedido);

// Excluir pedido
router.delete("/:id", excluirPedido);

// 👉 Adicionar atualização (histórico de resolução parcial)
router.post("/:id/atualizacoes", adicionarAtualizacao);

// 👉 Finalizar pedido (resolução final + situation = FINALIZADO)
router.post("/:id/finalizar", finalizarPedido);

export default router;
