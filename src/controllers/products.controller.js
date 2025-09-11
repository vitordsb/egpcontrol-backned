import { ObjectId } from "mongodb";

// Buscar produtos de um pedido
const getProductsByPedidoId = async (req, res) => {
  try {
    const db = req.app.locals.db();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID do pedido inválido" });
    }

    const produtos = await db
      .collection("produtos")
      .find({ pedidoId: id })
      .toArray();

    res.json(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
};

// Adicionar produto a um pedido
const addProductToPedido = async (req, res) => {
  try {
    const db = req.app.locals.db();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID do pedido inválido" });
    }

    const produto = {
      ...req.body,
      pedidoId: id,
      dataCriacao: new Date(),
    };

    const result = await db.collection("produtos").insertOne(produto);

    res.status(201).json({ id: result.insertedId, ...produto });
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    res.status(500).json({ error: "Erro ao adicionar produto" });
  }
};

// Deletar produto de um pedido
const deleteProductToPedido = async (req, res) => {
  try {
    const db = req.app.locals.db();
    const { id, productId } = req.params; // <-- pega os dois params

    // Valida IDs
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "ID do produto inválido" });
    }
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID do pedido inválido" });
    }

    // Garante que está deletando apenas o produto dentro do pedido correto
    const result = await db.collection("produtos").deleteOne({
      _id: new ObjectId(productId),
      pedidoId: id,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: "Produto não encontrado neste pedido" });
    }

    res.json({ message: "Produto deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({ error: "Erro ao deletar produto" });
  }
};
export default {
  getProductsByPedidoId,
  addProductToPedido,
  deleteProductToPedido,
};
