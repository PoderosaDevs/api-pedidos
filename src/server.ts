import express from "express";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import usuarioRoutes from "./routes/usuarioRoutes";
import clienteRoutes from "./routes/clienteRoutes";
import pedidoRoutes from "./routes/pedidoRoutes";
import lojaRoutes from "./routes/lojaRoutes";
import canalRoutes from "./routes/canalRoutes";



const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || "https://pedidos-q5pa.vercel.app",
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
// app.options(/.*/, cors(corsOptions)); // opcional, se quiser manter

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
