import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../prisma/client"; // Verifique se o caminho do prisma está correto no seu projeto

const COOKIE_NAME = "usuarioId";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Opções do cookie para segurança
const cookieOptions = {
  httpOnly: true, // Impede acesso via JS no navegador (segurança contra XSS)
  sameSite: "lax" as const, // Proteção contra CSRF
  secure: process.env.NODE_ENV === "production", // HTTPS apenas em produção
  maxAge: ONE_DAY_MS,
};

// =========================================
// REGISTRAR USUÁRIO
// =========================================
export const registrarUsuario = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha } = req.body ?? {};

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }

    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }

    const hash = await bcrypt.hash(senha, 10);
    
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: hash },
    });

    // Login automático após registro (opcional, mas recomendado)
    res.cookie(COOKIE_NAME, String(usuario.id), cookieOptions);

    // Remove a senha do retorno para segurança
    const { senha: _omit, ...safeUser } = usuario;
    
    return res.status(201).json(safeUser);
  } catch (err) {
    console.error("Erro no registro:", err);
    return res.status(500).json({ error: "Erro ao registrar usuário" });
  }
};

// =========================================
// LOGIN
// =========================================
export const loginUsuario = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body ?? {};

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Cria o cookie de sessão (HTTP Only)
    res.cookie(COOKIE_NAME, String(usuario.id), cookieOptions);

    return res.json({ 
      message: "Login realizado com sucesso",
      user: { nome: usuario.nome, email: usuario.email } // Retorna dados básicos
    });
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
};

// =========================================
// GET PERFIL (Validação de Sessão)
// =========================================
export const getPerfilUsuario = async (req: Request, res: Response) => {
  try {
    // Verifica se o cookie existe de forma segura
    const userId = req.cookies?.[COOKIE_NAME]; 

    if (!userId) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        nome: true,
        email: true,
        // Senha nunca deve ser retornada aqui
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
    });

  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    return res.status(500).json({ error: "Erro ao buscar perfil" });
  }
};

// =========================================
// LOGOUT
// =========================================
export const logoutUsuario = (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  return res.json({ message: "Logout efetuado com sucesso" });
};