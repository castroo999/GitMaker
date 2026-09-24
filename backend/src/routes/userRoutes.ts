import { Router } from "express";
import { loginUser, cadastroUser } from "../controllers/authController";

const router = Router();

router.post("/login", loginUser);

router.post("/cadastro", cadastroUser);

export default router;