import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import {
  deletarArquivo,
  enviarFotoPerfil,
} from "../services/storageService";

const LIMITE_DESCRICAO = 500;

export async function obterPerfil(req: Request, res: Response) {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ mensagem: "Usuário não autenticado." });
  }

  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nome: true,
      email: true,
      descricao: true,
      fotoPerfil: true,
      projetos: {
        orderBy: [
          { curtidas: { _count: "desc" } },
          { createdAt: "desc" },
        ],
        include: {
          midias: {
            select: { id: true, nome: true, tipo: true, url: true },
          },
          _count: { select: { curtidas: true } },
          curtidas: {
            where: { userId },
            select: { userId: true },
          },
        },
      },
    },
  });

  if (!usuario) {
    return res.status(404).json({ mensagem: "Usuário não encontrado." });
  }

  const { projetos, ...dadosUsuario } = usuario;
  return res.status(200).json({ usuario: dadosUsuario, projetos });
}

export async function atualizarPerfil(req: Request, res: Response) {
  const userId = req.userId;
  const { descricao } = req.body as { descricao?: unknown };
  const foto = req.file;

  if (!userId) {
    return res.status(401).json({ mensagem: "Usuário não autenticado." });
  }

  if (
    typeof descricao !== "string" ||
    descricao.length > LIMITE_DESCRICAO
  ) {
    return res.status(400).json({
      mensagem: `A descrição deve ter até ${LIMITE_DESCRICAO} caracteres.`,
    });
  }

  const usuarioAtual = await prisma.user.findUnique({
    where: { id: userId },
    select: { fotoPerfil: true },
  });

  if (!usuarioAtual) {
    return res.status(404).json({ mensagem: "Usuário não encontrado." });
  }

  let novaFotoUrl: string | undefined;
  try {
    if (foto) {
      novaFotoUrl = (await enviarFotoPerfil(foto, userId)).url;
    }

    const usuario = await prisma.user.update({
      where: { id: userId },
      data: {
        descricao: descricao.trim() || null,
        ...(novaFotoUrl && { fotoPerfil: novaFotoUrl }),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        descricao: true,
        fotoPerfil: true,
      },
    });

    if (novaFotoUrl && usuarioAtual.fotoPerfil) {
      await deletarArquivo(usuarioAtual.fotoPerfil);
    }

    return res.status(200).json({
      mensagem: "Perfil atualizado com sucesso.",
      usuario,
    });
  } catch (error: unknown) {
    if (novaFotoUrl) {
      await deletarArquivo(novaFotoUrl);
    }

    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({
      mensagem: "Não foi possível atualizar o perfil.",
    });
  }
}
