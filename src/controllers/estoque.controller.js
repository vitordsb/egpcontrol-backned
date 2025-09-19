import { ObjectId } from "mongodb";

// Adicionar entrada (compra) ao estoque
const addEstoque = async (req, res) => {
  try {
    const db = req.app.locals.db();
    const { nome, quantidade } = req.body;

    if (!nome || !quantidade) {
      return res
        .status(400)
        .json({ error: "Nome e quantidade são obrigatórios" });
    }

    // Verifica se já existe no estoque
    const existente = await db.collection("estoque").findOne({ nome });

    if (existente) {
      await db
        .collection("estoque")
        .updateOne(
          { _id: existente._id },
          { $inc: { quantidade }, $set: { dataAtualizacao: new Date() } },
        );
    } else {
      await db.collection("estoque").insertOne({
        nome,
        quantidade,
        dataAtualizacao: new Date(),
      });
    }

    res.json({ message: "Entrada registrada no estoque" });
  } catch (error) {
    console.error("Erro ao adicionar estoque:", error);
    res.status(500).json({ error: "Erro ao adicionar estoque" });
  }
};

// Listar saldo consolidado
const getEstoque = async (req, res) => {
  try {
    const db = req.app.locals.db();

    // Quantidade pedida ainda não saída
    const pedidosPendentes = await db
      .collection("produtos")
      .aggregate([
        {
          $lookup: {
            from: "pedidos",
            let: { pedidoIdStr: { $toString: "$pedidoId" } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: [{ $toString: "$_id" }, "$$pedidoIdStr"] },
                  dataSaida: { $exists: false },
                },
              },
            ],
            as: "pedido",
          },
        },
        { $unwind: "$pedido" },
        {
          $group: {
            _id: "$nome",
            quantidadePedidos: { $sum: "$quantidade" },
          },
        },
      ])
      .toArray();

    // Estoque disponível
    const estoque = await db.collection("estoque").find().toArray();

    // Consolida os dados
    const relatorio = pedidosPendentes.map((p) => {
      const itemEstoque = estoque.find((e) => e.nome === p._id);
      return {
        nome: p._id,
        quantidadePedidos: p.quantidadePedidos,
        estoque: itemEstoque ? itemEstoque.quantidade : 0,
      };
    });

    res.json(relatorio);
  } catch (error) {
    console.error("Erro ao buscar estoque:", error);
    res.status(500).json({ error: "Erro ao buscar estoque" });
  }
};

// Debitar estoque na saída do pedido
const debitarEstoque = async (nome, quantidade, db) => {
  await db.collection("estoque").updateOne(
    { nome },
    {
      $inc: { quantidade: -quantidade },
      $set: { dataAtualizacao: new Date() },
    },
  );
};
// GET /estoque/detalhes?nome=Produto ABC
const getDetalhesPorNome = async (req, res) => {
  try {
    const db = req.app.locals.db();
    const { nome } = req.query;

    if (!nome)
      return res.status(400).json({ error: "Parâmetro 'nome' é obrigatório" });

    const detalhes = await db
      .collection("produtos")
      .aggregate([
        { $match: { nome } },
        {
          $lookup: {
            from: "pedidos",
            let: { pid: "$pedidoId" },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$pid"] } } }],
            as: "pedido",
          },
        },
        { $unwind: "$pedido" },
        // apenas pedidos pendentes (sem saída)
        { $match: { "pedido.dataSaida": { $exists: false } } },
        {
          $project: {
            _id: 0,
            pedidoId: "$pedido._id",
            numeroPedido: "$pedido.numeroPedido",
            numeroNfe: "$pedido.numeroNfe",
            dataPrevista: "$pedido.dataPrevista",
            dataPedido: "$pedido.dataPedido",
          },
        },
        { $sort: { dataPrevista: 1, dataPedido: 1 } },
      ])
      .toArray();

    res.json(detalhes);
  } catch (e) {
    console.error("Erro ao buscar detalhes por produto:", e);
    res.status(500).json({ error: "Erro ao buscar detalhes" });
  }
};
const retirarEstoque = async (req, res) => {
  try {
    const db = req.app.locals.db();
    const { nome, quantidade } = req.body;

    if (!nome || !quantidade || quantidade <= 0) {
      return res
        .status(400)
        .json({ error: "Nome e quantidade (>0) são obrigatórios" });
    }

    // Atualiza se (e somente se) houver saldo suficiente (quantidade >= qtd)
    const result = await db.collection("estoque").updateOne(
      { nome, quantidade: { $gte: quantidade } },
      {
        $inc: { quantidade: -quantidade },
        $set: { dataAtualizacao: new Date() },
      },
    );

    if (result.matchedCount === 0) {
      return res
        .status(400)
        .json({ error: "Estoque insuficiente ou produto inexistente" });
    }

    res.json({ message: "Saída registrada no estoque" });
  } catch (error) {
    console.error("Erro ao retirar estoque:", error);
    res.status(500).json({ error: "Erro ao retirar estoque" });
  }
};

export default {
  addEstoque,
  getEstoque,
  debitarEstoque,
  getDetalhesPorNome,
  retirarEstoque,
};
