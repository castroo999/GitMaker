import type { Prisma } from "../generated/prisma/client";

export type CategoriaNotificacao = "projetos" | "comunidades" | "permissoes";

interface NovaNotificacao {
  userId: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  link: string;
}

export async function criarNotificacao(
  transacao: Prisma.TransactionClient,
  categoria: CategoriaNotificacao,
  notificacao: NovaNotificacao,
) {
  const preferencias = await transacao.notificationPreference.findUnique({
    where: { userId: notificacao.userId },
    select: { projetos: true, comunidades: true, permissoes: true },
  });

  if (preferencias && !preferencias[categoria]) return;

  await transacao.notification.create({ data: notificacao });
}
