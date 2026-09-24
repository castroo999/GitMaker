import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type TokenPayload = {
  userId: number;
};

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).json({
      mensagem: "Token não informado",
    });
    return;
  }

  const [tipo, token] = authorization.split(" ");

  if (tipo !== "Bearer" || !token) {
    res.status(401).json({
      mensagem: "Formato do token inválido",
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({
      mensagem: "JWT_SECRET não foi definida",
    });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret);

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.userId !== "number"
    ) {
      res.status(401).json({
        mensagem: "Token inválido",
      });
      return;
    }

    req.userId = payload.userId;

    next();
  } catch {
    res.status(401).json({
      mensagem: "Token inválido ou expirado",
    });
  }
}