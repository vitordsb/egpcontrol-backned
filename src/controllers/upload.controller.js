import fs from "fs";
import xml2js from "xml2js";
import { ObjectId } from "mongodb";

const uploadXmlPedido = async (req, res) => {
  try {
    const db = req.app.locals.db();

    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    // Lê o arquivo XML
    const xml = fs.readFileSync(req.file.path, "utf8");
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xml);

    const nfe = result.nfeProc.NFe.infNFe;

    // Cria o pedido (bem resumido)
    const pedido = {
      numeroNfe: nfe.ide.nNF,
      dataPedido: new Date(nfe.ide.dhEmi),
      cliente: nfe.dest.xNome,
      dataCriacao: new Date(),
      dataPrevista: new Date(nfe.ide.dhEmi),
    };

    const pedidoResult = await db.collection("pedidos").insertOne(pedido);

    // Cria os produtos (só nome, quantidade e data)
    const produtos = Array.isArray(nfe.det) ? nfe.det : [nfe.det];

    const produtosInsert = produtos.map((p) => ({
      pedidoId: pedidoResult.insertedId,
      nome: p.prod.xProd,
      quantidade: parseFloat(p.prod.qCom),
      dataCriacao: new Date(),
    }));

    if (produtosInsert.length > 0) {
      const insertResult = await db
        .collection("produtos")
        .insertMany(produtosInsert);
      console.log("Resultado da inserção de produtos:", insertResult);
    }

    res.status(201).json({
      message: "Pedido e produtos importados com sucesso",
      pedidoId: pedidoResult.insertedId,
    });
  } catch (error) {
    console.error("Erro ao importar XML:", error);
    res.status(500).json({ error: "Erro ao importar XML" });
  }
};

export default { uploadXmlPedido };
