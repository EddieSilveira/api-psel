const express = require('express');
const cors = require('cors');
require('dotenv').config();
const InicializaMongoServer = require('./config/db');
InicializaMongoServer();

const app = express();
const PORT = process.env.PORT || 4000;

const rotasUsuario = require('./routes/Usuario');

app.use(cors());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader('Access-Control-Allow-Headers', '*');

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  );
  next();
});

app.disable('x-powered-by');
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API online!', version: '1.0.1' });
});

app.use('/usuarios', rotasUsuario);

app.use(function (req, res) {
  res.status(404).json({
    message: `A rota ${req.originalUrl} não existe!`,
  });
});

app.listen(PORT, (req, res) => {
  console.log(`Servidor Web rodando na porta ${PORT}`);
});
