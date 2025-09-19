import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

import uploadRoutes from "./routes/upload.routes.js";
import pedidosRoutes from "./routes/pedidos.routes.js";
import authRoutes from "./routes/auth.routes.js";
import productsRoutes from "./routes/products.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import estoqueRoutes from "./routes/estoque.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;

MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Conectado ao MongoDB");
    db = client.db();

    // Criar índices
    db.collection("pedidos").createIndex({ numeroPedido: 1 });
    db.collection("pedidos").createIndex({ numeroNfe: 1 });
    db.collection("pedidos").createIndex({ cliente: 1 });
    db.collection("produtos").createIndex({ pedidoId: 1 });
  })
  .catch((error) => console.error("Erro ao conectar ao MongoDB:", error));

// Export db and ObjectId for use in other modules
app.locals.db = () => db;
app.locals.ObjectId = ObjectId;

// Rotas
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/login", authRoutes);
app.use("/api/pedidos", productsRoutes);
app.use("/api", reportsRoutes);
app.use("/api/pedidos", uploadRoutes);
app.use("/api/estoque", estoqueRoutes);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
