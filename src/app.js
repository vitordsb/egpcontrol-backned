const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

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

// Routes will be imported here later

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const pedidosRoutes = require("./routes/pedidos.routes");
app.use("/api/pedidos", pedidosRoutes);

const authRoutes = require("./routes/auth.routes");
const productsRoutes = require("./routes/products.routes");
const reportsRoutes = require("./routes/reports.routes");

app.use("/api/login", authRoutes);
app.use("/api/pedidos", productsRoutes);
app.use("/api", reportsRoutes);
