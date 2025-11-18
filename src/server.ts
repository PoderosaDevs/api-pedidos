import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import usuarioRoutes from "./routes/usuarioRoutes";
import clienteRoutes from "./routes/clienteRoutes";
import pedidoRoutes from "./routes/pedidoRoutes";
import lojaRoutes from "./routes/lojaRoutes";
import canalRoutes from "./routes/canalRoutes";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// 🔓 CORS totalmente liberado
app.use(cors({
  origin: true,        // aceita qualquer origem
  credentials: true    // permite cookies/sessões
}));

// Se quiser habilitar OPTIONS universal (opcional):
// app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

app.use("/usuarios", usuarioRoutes);
app.use("/clientes", clienteRoutes);
app.use("/pedidos", pedidoRoutes);
app.use("/lojas", lojaRoutes);
app.use("/canais", canalRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
