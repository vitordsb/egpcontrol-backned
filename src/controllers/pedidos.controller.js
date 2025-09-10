const { ObjectId } = require("mongodb");
const { calcularStatus } = require("../utils/status");

const getPedidos = async (req, res) => {
  try {
    const db = req.app.locals.db();
    const { page = 1, limit = 25, search, column } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};

    if (search && column) {
      switch (column) {
        case "cliente":
          filter.cliente = { $regex: search, $options: "i" };
          break;
        case "numeroPedido":
          filter.numeroPedido = { $regex: search, $options: "i" };
          break;
        case "numeroNfe":
          filter.numeroNfe = { $regex: search, $options: "i" };
          break;
        case "financeira":
          filter.financeira = { $regex: search, $options: "i" };
          break;
        case "transportadora":
          filter.transportadora = { $regex: search, $options: "i" };
          break;
      }
    }

    const pedidos = await db
      .collection("pedidos")
      .find(filter)
      .sort({ dataPedido: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const pedidosComStatus = pedidos.map((pedido) => ({
      ...pedido,
      status: calcularStatus(pedido.dataPrevista, pedido.dataSaida),
    }));

    const total = await db.collection("pedidos").countDocuments(filter);

    res.json({
      pedidos: pedidosComStatus,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
};

const createPedido = async (req, res) => {
  try {
    const db = req.app.locals.db();
    const pedido = {
      ...req.body,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    };

    const result = await db.collection("pedidos").insertOne(pedido);
    res.status(201).json({ id: result.insertedId, ...pedido });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar pedido" });
  }
};

const updatePedido = async (req, res) => {
  try {
    const db = req.app.locals.db();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      dataAtualizacao: new Date(),
    };

    const result = await db
      .collection("pedidos")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    res.json({ message: "Pedido atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar pedido" });
  }
};

const updatePedidoStatus = async (req, res) => {
  try {
    const db = req.app.locals.db();
    const { id } = req.params;
    const { dataSaida, observacao } = req.body;

    const updateData = {
      dataSaida: dataSaida
        ? new Date(dataSaida.split("/").reverse().join("-"))
        : undefined,
      observacao,
    };

    const result = await db
      .collection("pedidos")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    res.json({ message: "Status atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar status" });
  }
};

module.exports = {
  getPedidos,
  createPedido,
  updatePedido,
  updatePedidoStatus,
};
