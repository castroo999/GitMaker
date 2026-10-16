import { Router } from "express";
import { loginUser, cadastroUser } from "../controllers/authController";
import { atualizarPerfil, obterPerfil } from "../controllers/perfilController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { receberFotoPerfil } from "../middlewares/uploadMiddleware";

const router = Router();

router.post("/login", loginUser);

router.post("/cadastro", cadastroUser);

router.get("/perfil", authMiddleware, obterPerfil);
router.put("/perfil", authMiddleware, receberFotoPerfil, atualizarPerfil);

export default router;