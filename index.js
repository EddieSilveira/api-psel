const express = require('express');
const cors = require('cors');
require('dotenv').config();
const InicializaMongoServer = require('./config/db');
InicializaMongoServer();

const app = express();
const PORT = process.env.PORT || 4000;
const jwt = require('jsonwebtoken');
const tokenSecret = process.env.SECRET;

const Usuario = require('./model/Usuario');
const rotasUsuario = require('./routes/Usuario');
const rotasUpload = require('./routes/Upload');

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

//TOKEN JWT
function verificaJWT(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token)
    return res.status(401).json({ auth: false, message: 'No token provided.' });

  jwt.verify(token, tokenSecret, function (err, decoded) {
    if (err)
      return res
        .status(500)
        .json({ auth: false, message: 'Failed to authenticate token' });

    req.userId = decoded.id;
    next();
  });
}

//Autenticação
app.post('/signin', async (req, res, next) => {
  const usuarios = await Usuario.find();
  let id = null;
  let token = null;
  usuarios.forEach((usuario) => {
    if (
      req.body.login === usuario.cpf ||
      (req.body.login === usuario.email && req.body.senha === usuario.senha)
    ) {
      id = usuario._id;
      token = jwt.sign({ id }, tokenSecret, {
        expiresIn: 999,
      });
    }
  });

  if (token) return res.status(200).json({ auth: true, token: token });
  if (!token) return res.status(500).json({ message: 'Login Inválido' });
});

app.post('/signout', function (req, res) {
  res.json({ auth: false, token: null });
});

app.get('/', (req, res) => {
  res.json({ message: 'API online!', version: '1.0.1' });
});

app.use('/usuarios', rotasUsuario);
app.use('/upload', rotasUpload);

app.use(function (req, res) {
  res.status(404).json({
    message: `A rota ${req.originalUrl} não existe!`,
  });
});

app.listen(PORT, (req, res) => {
  console.log(`Servidor Web rodando na porta ${PORT}`);
});
