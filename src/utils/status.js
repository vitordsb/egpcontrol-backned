const calcularStatus = (dataPrevista, dataSaida) => {
  if (dataSaida) {
    return `Saiu na data ${new Date(dataSaida).toLocaleDateString("pt-BR")}`;
  }

  const hoje = new Date();
  const previsao = new Date(dataPrevista);

  if (hoje < previsao) {
    return "Em produção";
  } else {
    return "Em atraso";
  }
};

module.exports = { calcularStatus };


