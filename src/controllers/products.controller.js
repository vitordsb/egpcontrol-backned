const { ObjectId } = require("mongodb");

const getProductsByPedidoId = async (req, res) => {
  try {
    const db = req.app.locals.db();
    const { id } = req.params;
    const produtos = await db
      .collection("produtos")
      .find({ pedidoId: id })
      .toArray();

    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
};

const addProductToPedido = async (req, res) => {
  try {
    const db = req.app.locals.db();
    const { id } = req.params;
    const produto = {
      ...req.body,
      pedidoId: id,
      dataCriacao: new Date(),
    };

    const result = await db.collection("produtos").insertOne(produto);
    res.status(201).json({ id: result.insertedId, ...produto });
  } catch (error) {
    res.status(500).json({ error: "Erro ao adicionar produto" });
  }
};

module.exports = {
  getProductsByPedidoId,
  addProductToPedido,
};


