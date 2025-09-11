const getRelatorioCompras = async (req, res) => {
  try {
    const db = req.app.locals.db();
    const produtos = await db
      .collection("produtos")
      .aggregate([
        // Relaciona produto com seu pedido
        {
          $lookup: {
            from: "pedidos",
            localField: "pedidoId",
            foreignField: "_id", // cuidado: se você salvou pedidoId como string, mude para string também
            as: "pedido",
          },
        },
        { $unwind: "$pedido" },

        // Só pedidos que ainda não saíram
        { $match: { "pedido.dataSaida": { $exists: false } } },

        // Agrupa produtos dos pedidos ativos
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
