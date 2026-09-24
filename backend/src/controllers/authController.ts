
import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

type CadastroBody = {
  nome: string;
  email: string;
  senha: string;
};

type LoginBody = {
  email: string;
  senha: string;
};

export async function cadastroUser(
  req: Request<{}, {}, CadastroBody>,
  res: Response,
) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    res.status(400).json({
      mensagem: "Preencha todos os campos",
    });
    return;
  }

  if (!email.includes("@")) {
    res.status(400).json({
      mensagem: "Informe um e-mail válido",
    });
    return;
  }

  if (senha.length < 6) {
    res.status(400).json({
      mensagem: "A senha deve conter no mínimo 6 caracteres",
    });
    return;
  }

  const emailPadrao = email.trim().toLowerCase();

  const emailJaExiste = await prisma.user.findUnique({
    where: {
      email: emailPadrao,
    },
  });

  if (emailJaExiste) {
    res.status(409).json({
      mensagem: "O e-mail informado já está cadastrado",
    });
    return;
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const usuario = await prisma.user.create({
    data: {
      nome: nome.trim(),
      email: emailPadrao,
      senha: senhaHash,
    },
  });

  res.status(201).json({
    mensagem: "Usuário cadastrado com sucesso",
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    },
  });
}

export async function loginUser(
  req: Request<{}, {}, LoginBody>,
  res: Response,
) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    res.status(400).json({
      mensagem: "Informe o e-mail e a senha",
    });
    return;
  }

  const emailPadrao = email.trim().toLowerCase();

  const usuario = await prisma.user.findUnique({
    where: {
      email: emailPadrao,
    },
  });

  if (!usuario) {
    res.status(401).json({
      mensagem: "E-mail ou senha incorretos",
    });
    return;
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

  if (!senhaCorreta) {
    res.status(401).json({
      mensagem: "E-mail ou senha incorretos",
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET não foi definida");
  }

  const token = jwt.sign(
    {
      userId: usuario.id,
    },
    jwtSecret,
    {
      expiresIn: "1d",
    },
  );

  res.status(200).json({
    mensagem: "Login realizado com sucesso",
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    },
  });
}