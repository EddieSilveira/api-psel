const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();
const InicializaMongoServer = require('./config/db');
InicializaMongoServer();

const Usuario = require('./model/Usuario');
const rotasUsuario = require('./routes/Usuario');
const rotasUpload = require('./routes/Upload');

const app = express();
app.use(express.static('public'));
const PORT = process.env.PORT || 4000;
const jwt = require('jsonwebtoken');
const tokenSecret = process.env.SECRET;

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader('Access-Control-Allow-Headers', '*');

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  );
  next();
});

app.use(cors());
app.disable('x-powered-by');
app.use(express.json());

//TOKEN JWT
function verificaJWT(req, res, next) {
  const token = req.headers['x-access-token'];
  const tokenFormated = token;

  if (!token)
    return res.status(401).json({ auth: false, message: 'No token provided.' });

  jwt.verify(tokenFormated, tokenSecret, function (err, decoded) {
    if (err)
      return res
        .status(500)
        .json({ auth: false, message: 'Failed to authenticate token' });

    req.userId = decoded.id;
    next();
  });
}

//Cadastro
app.post('/signup', async (req, res) => {
  const { cpf } = req.body;
  let usuario = await Usuario.findOne({ cpf });
  if (usuario)
    return res.status(200).json({
      erro: { message: 'Já existe um usuário com o cpf informado' },
    });
  try {
    const hashedPassword = await bcrypt.hash(req.body.senha, 10);
    const user = {
      nome: req.body.nome,
      cpf: req.body.cpf,
      email: req.body.email,
      senha: hashedPassword,
      nivelAcesso: req.body.nivelAcesso,
      foto: {
        originalName: req.body.foto.originalName,
        path: req.body.foto.path,
        size: req.body.foto.size,
        mimetype: req.body.foto.mimetype,
      },
    };
    let usuario = new Usuario(user);
    let id = usuario._id;
    let token = jwt.sign({ id }, tokenSecret, {
      expiresIn: 999,
    });
    await usuario.save();
    res.status(200).json({ auth: true, token: token });
  } catch (err) {
    return res.status(500).json({
      erros: [{ message: `Erro ao salvar o usuario: ${err.message}` }],
    });
  }
});

//Autenticação
app.post('/signin', async (req, res, next) => {
  const usuarios = await Usuario.find();
  const usuario = usuarios.find(
    (usuario) =>
      usuario.cpf === req.body.login || usuario.email === req.body.login,
  );

  if (usuario === null) {
    return res.status(400).send('Não foi possível encontrar o usuário!');
  }

  try {
    if (await bcrypt.compare(req.body.senha, usuario.senha)) {
      let id = usuario._id;
      let token = jwt.sign({ id }, tokenSecret, {
        expiresIn: 999,
      });
      res.status(200).json({ auth: true, token: token });
    } else {
      res.status(500).json({ message: 'Login Inválido' });
    }
  } catch {
    res.status(500).send();
  }
});

app.post('/signout', function (req, res) {
  res.json({ auth: false, token: null });
});

app.get('/', (req, res) => {
  res.json({ message: 'API online!', version: '1.0.1' });
});

app.use('/usuarios', verificaJWT, rotasUsuario);
app.use('/upload', rotasUpload);

app.use(function (req, res) {
  res.status(404).json({
    message: `A rota ${req.originalUrl} não existe!`,
  });
});

app.listen(PORT, (req, res) => {
  console.log(`Servidor Web rodando na porta ${PORT}`);
});
