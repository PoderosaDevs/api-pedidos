import { prisma } from "../../prisma/client";

export async function atualizarStatusPedido(pedido: any) {
  if (pedido.situation === "FINALIZADO") return pedido;

  const ultimaAtualizacao = new Date(pedido.dataAtualizacao);
  const agora = new Date();

  const diffDias =
    Math.floor((agora.getTime() - ultimaAtualizacao.getTime()) / (1000 * 60 * 60 * 24));

  let novaPrioridade = pedido.prioridade;

  if (diffDias >= 5) novaPrioridade = "ALTA";
  else if (diffDias >= 4) novaPrioridade = "MEDIA";

  if (novaPrioridade !== pedido.prioridade) {
    return prisma.pedido.update({
      where: { id: pedido.id },
      data: { prioridade: novaPrioridade },
      include: { cliente: true, loja: true, historico: true },
    });
  }

  return pedido;
}
