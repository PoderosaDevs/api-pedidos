import { prisma } from "../../prisma/client";

export async function adicionarHistorico(pedidoId: number, descricao: string) {
  return prisma.pedidoHistorico.create({
    data: {
      pedidoId,
      descricao,
    },
  });
}
