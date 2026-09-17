const express = require("express");
const cors = require("cors");
const path = require("path");

// [1] e [2] Importações do Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");

const app = express();
const routes = require("./routes");

// Middlewares globais
app.use(cors()); // Habilita o CORS para permitir requisições do frontend
app.use(express.json());

// Servir arquivos estáticos (como as imagens de uploads)
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// Registro de todas as rotas da API centralizadas
app.use("/", routes);

// [3] Criando a rota mágica da Documentação
// Sempre que alguém acessar localhost:3000/api-docs, o swagger vai desenhar a tela baseada no seu JSON
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

module.exports = app;
