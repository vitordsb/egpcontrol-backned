const getRelatorioCompras = async (req, res) => {
  try {
    const db = req.app.locals.db();
    const produtos = await db
      .collection("produtos")
      .aggregate([
        {
          $group: {
            _id: "$nome",
            quantidadeTotal: { $sum: "$quantidade" },
            pedidos: { $addToSet: "$pedidoId" },
          },
        },
        {
          $project: {
            nome: "$_id",
            quantidadeTotal: 1,
            numeroPedidos: { $size: "$pedidos" },
            _id: 0,
          },
        },
        { $sort: { nome: 1 } },
      ])
      .toArray();

    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar relatório de compras" });
  }
};

module.exports = { getRelatorioCompras };


