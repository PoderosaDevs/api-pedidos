import type { Request, Response } from "express";
import { prisma } from "../../prisma/client";

// GET /canais
  export const listarCanais = async (_req: Request, res: Response) => {
    try {
      const canais = await prisma.canal.findMany({
        orderBy: { id: "asc" },
        include: { lojas: true }, // agora inclui lojas
      });
      return res.json(canais);
    } catch (err) {
      return res.status(500).json({ error: "Erro ao listar canais" });
    }
  };

// GET /canais/:id
export const obterCanal = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const canal = await prisma.canal.findUnique({
      where: { id },
      include: { lojas: true }, // inclui lojas
    });

    if (!canal) return res.status(404).json({ error: "Canal não encontrado" });

    return res.json(canal);
  } catch {
    res.status(500).json({ error: "Erro ao obter canal" });
  }
};

// POST /canais
export const criarCanal = async (req: Request, res: Response) => {
  try {
    const { nome, descricao } = req.body ?? {};

    if (!nome) return res.status(400).json({ error: "nome é obrigatório" });

    const canal = await prisma.canal.create({
      data: { nome, descricao },
    });

    return res.status(201).json(canal);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao criar canal" });
  }
};

// PUT /canais/:id
export const atualizarCanal = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { nome, descricao } = req.body ?? {};

    const canal = await prisma.canal.update({
      where: { id },
      data: { nome, descricao },
    });

    return res.json(canal);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao atualizar canal" });
  }
};

// DELETE /canais/:id
export const deletarCanal = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.canal.delete({ where: { id } });

    return res.json({ message: "Canal excluído com sucesso" });
 } catch (err) {
  console.error(err); // <-- log do erro real
  return res.status(500).json({ error: "Erro ao excluir canal" });
}

};
