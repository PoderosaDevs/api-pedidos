import { Router } from "express";
import {
  registrarUsuario,
  loginUsuario,
  logoutUsuario,
  getPerfilUsuario, // <--- Adicionado
} from "../controllers/usuarioController";

const router = Router();

router.post("/register", registrarUsuario);
router.post("/login", loginUsuario);
router.post("/logout", logoutUsuario);

// Rota para validar a sessão ao recarregar a página
router.get("/me", getPerfilUsuario); // <--- Adicionado

export default router;