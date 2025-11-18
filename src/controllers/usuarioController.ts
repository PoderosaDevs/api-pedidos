import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

import { prisma } from "../../prisma/client";

const COOKIE_NAME = "usuarioId";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: ONE_DAY_MS,
};

// POST /usuarios/register
export const registrarUsuario = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha } = req.body ?? {};
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "nome, email e senha são obrigatórios" });
    }

    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) return res.status(409).json({ error: "E-mail já cadastrado" });

    const hash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: hash },
    });

    // não devolver a senha no payload
    const { senha: _omit, ...safeUser } = usuario;
    return res.status(201).json(safeUser);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao registrar usuário" });
  }
};

// POST /usuarios/login
export const loginUsuario = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body ?? {};
    if (!email || !senha) {
      return res.status(400).json({ error: "email e senha são obrigatórios" });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });

    const ok = await bcrypt.compare(senha, usuario.senha);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    res.cookie(COOKIE_NAME, String(usuario.id), cookieOptions);
    return res.json({ message: "Login realizado com sucesso" });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
};

// POST /usuarios/logout
export const logoutUsuario = (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  return res.json({ message: "Logout efetuado com sucesso" });
};
