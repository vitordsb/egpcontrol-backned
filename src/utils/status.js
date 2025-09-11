export const calcularStatus = (dataPrevista, dataSaida) => {
  try {
    if (dataSaida) {
      const saida = new Date(dataSaida);
      return `Saiu na data ${saida.toLocaleDateString("pt-BR")}`;
    }

    if (!dataPrevista) {
      return "Data prevista não informada";
    }

    const hoje = new Date();
    const previsao = new Date(dataPrevista);

    if (isNaN(previsao)) {
      return "Data prevista inválida";
    }

    return hoje < previsao ? "Em produção" : "Em atraso";
  } catch (error) {
    console.error("Erro ao calcular status:", error);
    return "Erro ao calcular status";
  }
};
