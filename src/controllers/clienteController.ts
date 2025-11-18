import { prisma } from "../../prisma/client";
import type { Request, Response } from "express";

// GET /clientes
export const listarClientes = async (_req: Request, res: Response) => {
  try {
    const clientes = await prisma.cliente.findMany({ orderBy: { id: "asc" } });
    return res.json(clientes);
  } catch {
    return res.status(500).json({ error: "Erro ao listar clientes" });
  }
};

// POST /clientes
export const criarCliente = async (req: Request, res: Response) => {
  try {
    const { nome, cpf } = req.body ?? {};
    if (!nome || !cpf) {
      return res.status(400).json({ error: "nome e cpf são obrigatórios" });
    }

    // validação simples de CPF (apenas formato, opcional)
    const cpfLimpo = String(cpf).replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      return res.status(400).json({ error: "CPF inválido" });
    }

    const cliente = await prisma.cliente.create({
      data: { nome, cpf: cpfLimpo },
    });

    return res.status(201).json(cliente);
  } catch (err: any) {
    // violação de unique (P2002), etc.
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "CPF já cadastrado" });
    }
    return res.status(500).json({ error: "Erro ao criar cliente" });
  }
};

// PUT /clientes/:id
export const atualizarCliente = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const { nome, cpf } = req.body ?? {};
    const data: { nome?: string; cpf?: string } = {};
    if (nome) data.nome = nome;
    if (cpf) {
      const cpfLimpo = String(cpf).replace(/\D/g, "");
      if (cpfLimpo.length !== 11) {
        return res.status(400).json({ error: "CPF inválido" });
      }
      data.cpf = cpfLimpo;
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data,
    });

    return res.json(cliente);
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "CPF já cadastrado" });
    }
    return res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
};

// DELETE /clientes/:id
export const deletarCliente = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    await prisma.cliente.delete({ where: { id } });
    return res.json({ message: "Cliente removido" });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    return res.status(500).json({ error: "Erro ao deletar cliente" });
  }
};
