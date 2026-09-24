import express, { Request, Response, NextFunction } from "express";
import projetosRoutes from './routes/projetoRouters'
import etapasRoutes from "./routes/etapasRoutes";
import userRouter from "./routes/userRoutes";

import cors from "cors";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
        mensagem: "API funcionando certo"
    })
})

app.use("/auth", userRouter);

app.use("/projetos", projetosRoutes);

app.use("/api", etapasRoutes);


app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);

  res.status(500).json({
    erro: "Erro interno do servidor",
    mensagem: error.message,
  });
});

export default app;