import type { Request, Response, NextFunction } from "express";

export const autenticar = (req: Request, res: Response, next: NextFunction) => {
  const usuarioId = (req as any).cookies?.usuarioId; // se usar @types/cookie-parser, pode tipar melhor
  if (!usuarioId) return res.status(401).json({ error: "Não autenticado" });
  next();
};
