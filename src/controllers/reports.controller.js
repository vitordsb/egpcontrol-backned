const getRelatorioCompras = async (req, res) => {
  try {
    const db = req.app.locals.db();
    const produtos = await db
      .collection("produtos")
      .aggregate([
        {
          $lookup: {
            from: "pedidos",
            let: { pedidoIdStr: { $toString: "$pedidoId" } }, // converte para string
            pipeline: [
              {
                $match: {
                  $expr: { $eq: [{ $toString: "$_id" }, "$$pedidoIdStr"] },
                },
              },
            ],
            as: "pedido",
          },
        },
        { $unwind: "$pedido" },
        { $match: { "pedido.dataSaida": { $exists: false } } }, // só pedidos ativos
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
    console.error("Erro ao gerar relatório de compras:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de compras" });
  }
};

export default { getRelatorioCompras };
