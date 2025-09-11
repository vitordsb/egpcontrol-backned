const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username === "egpadmin" && password === "egp123") {
      const token = jwt.sign(
        { username: "egpadmin", role: "admin" },
        process.env.JWT_SECRET || "secret-key",
        { expiresIn: "24h" },
      );

      res.json({ token, user: { username: "egpadmin", role: "admin" } });
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

module.exports = { login };
