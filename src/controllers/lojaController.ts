import type { Request, Response } from "express";
import { prisma } from "../../prisma/client";

// GET /lojas
export const listarLojas = async (_req: Request, res: Response) => {
  try {
    const lojas = await prisma.loja.findMany({
      orderBy: { id: "asc" },
      include: {
        canal: true,     // retorna o canal da loja
        pedidos: false,  // coloque true se quiser retornar pedidos
      }
    });
    return res.json(lojas);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar lojas" });
  }
};

// GET /lojas/:id
export const obterLoja = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const loja = await prisma.loja.findUnique({
      where: { id },
      include: {
        canal: true,
        pedidos: false,
      }
    });

    if (!loja) return res.status(404).json({ error: "Loja não encontrada" });

    return res.json(loja);
  } catch {
    res.status(500).json({ error: "Erro ao obter loja" });
  }
};

// POST /lojas
export const criarLoja = async (req: Request, res: Response) => {
  try {
    const { nome, canalId } = req.body ?? {};

    if (!nome) return res.status(400).json({ error: "nome é obrigatório" });
    if (!canalId) return res.status(400).json({ error: "canalId é obrigatório" });

    const loja = await prisma.loja.create({
      data: {
        nome,
        canalId: Number(canalId),
      },
    });

    return res.status(201).json(loja);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao criar loja" });
  }
};

// PUT /lojas/:id
export const atualizarLoja = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { nome, canalId } = req.body ?? {};

    const loja = await prisma.loja.update({
      where: { id },
      data: {
        nome,
        canalId: canalId ? Number(canalId) : undefined,
      },
    });

    return res.json(loja);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao atualizar loja" });
  }
};

// DELETE /lojas/:id
export const deletarLoja = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.loja.delete({ where: { id } });

    return res.json({ message: "Loja excluída com sucesso" });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao excluir loja" });
  }
};
