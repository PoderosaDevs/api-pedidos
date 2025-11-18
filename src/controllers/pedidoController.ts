import type { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { adicionarHistorico } from "../utils/pedidoHistorico";
import { atualizarStatusPedido } from "../utils/atualizarPedido";

/**
 * ✅ Cria um novo pedido
 * POST /pedidos
 */
export const criarPedido = async (req: Request, res: Response) => {
  try {
    const {
      numeroPedido,
      numeroChamado,
      descricao,
      resolucao,
      numeroJit,
      prioridade,
      situacao,
      clienteId,
      lojaId,
      criadoPorId,
    } = req.body ?? {};

    if (!numeroPedido || !descricao || !prioridade || !clienteId || !lojaId) {
      return res.status(400).json({
        error:
          "Campos obrigatórios: numeroPedido, descricao, prioridade, clienteId, lojaId",
      });
    }

    const existe = await prisma.pedido.findUnique({ where: { numeroPedido } });
    if (existe)
      return res.status(409).json({ error: "Número de pedido já cadastrado" });

    const pedido = await prisma.pedido.create({
      data: {
        numeroPedido,
        numeroChamado,
        descricao,
        resolucao,
        numeroJit,
        prioridade,
        situacao,
        clienteId: Number(clienteId),
        lojaId: Number(lojaId), // 👈 associação com a loja
        criadoPorId: criadoPorId ? Number(criadoPorId) : undefined,
      },
      include: {
        cliente: true,
        criadoPor: true,
        loja: true, // 👈 já retorna a loja junto
      },
    });

    await adicionarHistorico(pedido.id, "Pedido criado");

    // aplica regras automáticas de prioridade/status
    const pedidoFinal = await atualizarStatusPedido(pedido);

    return res.status(201).json(pedidoFinal);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao criar pedido" });
  }
};

/**
 * ✅ Lista todos os pedidos
 * GET /pedidos
 */
export const listarPedidos = async (_req: Request, res: Response) => {
  try {
    let pedidos = await prisma.pedido.findMany({
      include: {
        cliente: true,
        criadoPor: true,
        historico: true,
        loja: true,
      },
      orderBy: { dataAtualizacao: "desc" },
    });

    // aplica regras automáticas em todos
    const atualizados = [];
    for (const p of pedidos) {
      atualizados.push(await atualizarStatusPedido(p));
    }

    return res.json(atualizados);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar pedidos" });
  }
};

/**
 * ✅ Busca pedido por ID
 * GET /pedidos/:id
 */
export const obterPedido = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: true,
        criadoPor: true,
        historico: true,
        loja: true, // 👈 inclui loja no detalhe
      },
    });

    if (!pedido)
      return res.status(404).json({ error: "Pedido não encontrado" });

    return res.json(pedido);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar pedido" });
  }
};

/**
 * ✅ Atualiza um pedido
 * PUT /pedidos/:id
 */
export const atualizarPedido = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const existe = await prisma.pedido.findUnique({
      where: { id },
      include: { historico: true }
    });

    if (!existe) return res.status(404).json({ error: "Pedido não encontrado" });

    const { resolucao, situation, ...resto } = req.body ?? {};

    const updates: any = {
      ...resto,
      dataAtualizacao: new Date(),
    };

    // --- SOMENTE AQUI ENTRA O HISTÓRICO ---
    if (typeof resolucao === "string" && resolucao.trim() !== "" && resolucao !== existe.resolucao) {
      updates.resolucao = resolucao;

      await prisma.pedidoHistorico.create({
        data: {
          pedidoId: id,
          descricao: resolucao, // 👈 O TEXTO DA RESOLUÇÃO
        },
      });
    }

    // --- FINALIZAR ---
    if (situation === "FINALIZADO") {
      updates.situation = "FINALIZADO";
      updates.dataFinalizacao = new Date();
    }

    const pedidoAtualizado = await prisma.pedido.update({
      where: { id },
      data: updates,
      include: {
        cliente: true,
        criadoPor: true,
        historico: true,
        loja: true,
      },
    });

    return res.json(pedidoAtualizado);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar pedido" });
  }
};


/**
 * ✅ Remove um pedido
 * DELETE /pedidos/:id
 */
export const excluirPedido = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    await prisma.pedido.delete({ where: { id } });
    return res.json({ message: "Pedido removido com sucesso" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao excluir pedido" });
  }
};

export const adicionarAtualizacao = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { descricao } = req.body;

    if (!descricao?.trim())
      return res.status(400).json({ error: "Descrição é obrigatória" });

    // 1 — Criar histórico com a resolução parcial
    await adicionarHistorico(id, descricao);

    // 2 — Atualizar data de atualização
    const pedido = await prisma.pedido.update({
      where: { id },
      data: {
        dataAtualizacao: new Date(),
      },
      include: { cliente: true, loja: true, historico: true },
    });

    // 3 — Verificar prioridade automática
    const final = await atualizarStatusPedido(pedido);

    return res.json(final);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao criar atualização" });
  }
};



export const finalizarPedido = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { resolucao } = req.body;

    if (!resolucao?.trim())
      return res.status(400).json({ error: "A resolução é obrigatória" });

    // 1 — Criar histórico da resolução final
    await adicionarHistorico(id, `RESOLUÇÃO FINAL: ${resolucao}`);

    // 2 — Atualizar o pedido
    const pedido = await prisma.pedido.update({
      where: { id },
      data: {
        resolucao,
        situation: "FINALIZADO",
        dataFinalizacao: new Date(),
        dataAtualizacao: new Date(),
      },
      include: { cliente: true, loja: true, historico: true },
    });

    return res.json(pedido);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao finalizar pedido" });
  }
};

