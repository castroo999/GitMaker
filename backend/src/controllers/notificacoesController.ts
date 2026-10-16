import type { Request, Response } from "express";
import prisma from "../lib/prisma";

const CATEGORIAS_PREFERENCIA = ["projetos", "comunidades", "permissoes"] as const;

function validarId(valor: string | string[] | undefined): number | null {
  if (typeof valor !== "string" || !valor.trim()) return null;
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function listarNotificacoes(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ mensagem: "Usuário não autenticado." });

    const notificacoes = await prisma.notification.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const naoLidas = await prisma.notification.count({
      where: { userId: Number(userId), lida: false },
    });

    return res.status(200).json({ notificacoes, naoLidas });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Não foi possível carregar as notificações." });
  }
}

export async function obterPreferenciasNotificacao(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ mensagem: "Usuário não autenticado." });

    const preferencias = await prisma.notificationPreference.upsert({
      where: { userId: Number(userId) },
      create: { userId: Number(userId) },
      update: {},
      select: { projetos: true, comunidades: true, permissoes: true },
    });
    return res.status(200).json({ preferencias });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Não foi possível carregar as preferências." });
  }
}

export async function atualizarPreferenciasNotificacao(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ mensagem: "Usuário não autenticado." });

    const entrada: unknown = req.body;
    if (typeof entrada !== "object" || entrada === null || Array.isArray(entrada)) {
      return res.status(400).json({ mensagem: "Preferências inválidas." });
    }

    const campos = Object.keys(entrada);
    if (
      campos.length === 0 ||
      campos.some((campo) => !CATEGORIAS_PREFERENCIA.includes(campo as typeof CATEGORIAS_PREFERENCIA[number])) ||
      campos.some((campo) => typeof (entrada as Record<string, unknown>)[campo] !== "boolean")
    ) {
      return res.status(400).json({ mensagem: "Informe ao menos uma preferência válida." });
    }

    const preferencias = await prisma.notificationPreference.upsert({
      where: { userId: Number(userId) },
      create: { userId: Number(userId), ...entrada },
      update: entrada,
      select: { projetos: true, comunidades: true, permissoes: true },
    });
    return res.status(200).json({ preferencias });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Não foi possível salvar as preferências." });
  }
}

export async function marcarNotificacaoComoLida(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const notificacaoId = validarId(req.params.notificacaoId);
    if (!userId) return res.status(401).json({ mensagem: "Usuário não autenticado." });
    if (!notificacaoId) return res.status(400).json({ mensagem: "ID da notificação inválido." });

    const resultado = await prisma.notification.updateMany({
      where: { id: notificacaoId, userId: Number(userId) },
      data: { lida: true },
    });
    if (resultado.count === 0) {
      return res.status(404).json({ mensagem: "Notificação não encontrada." });
    }

    return res.status(200).json({ mensagem: "Notificação marcada como lida." });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Não foi possível atualizar a notificação." });
  }
}

export async function marcarTodasComoLidas(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ mensagem: "Usuário não autenticado." });

    await prisma.notification.updateMany({
      where: { userId: Number(userId), lida: false },
      data: { lida: true },
    });

    return res.status(200).json({ mensagem: "Todas as notificações foram marcadas como lidas." });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Não foi possível atualizar as notificações." });
  }
}
