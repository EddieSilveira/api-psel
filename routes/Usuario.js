const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const Usuario = require('../model/Usuario');

//Lista os usuários
router.get('/', async (req, res) => {
  try {
    const usuario = await Usuario.find();
    res.json(usuario);
  } catch (err) {
    res.status(500).send({
      erros: [{ message: 'Não foi possível obter os usuários!' }],
    });
  }
});

//Inclui um novo usuário
router.post('/', async (req, res) => {
  const { cpf } = req.body;
  let usuario = await Usuario.findOne({ cpf });
  if (usuario)
    return res.status(200).json({
      erros: [{ message: 'Já existe um usuário com o cpf informado' }],
    });
  try {
    let usuario = new Usuario(req.body);
    await usuario.save();
    res.send(usuario);
  } catch (err) {
    return res.status(500).json({
      erros: [{ message: `Erro ao salvar o usuario: ${err.message}` }],
    });
  }
});

//Deletar um usuário
router.delete('/:id', async (req, res) => {
  await Usuario.findByIdAndRemove(req.params.id)
    .then((usuario) => {
      res.send({
        message: `Usuário ${usuario.nome} removido com sucesso!`,
      });
    })
    .catch((err) => {
      return res.status(500).send({
        erros: [
          {
            message: `Não foi possível apagar o usuário com o id ${req.params.id}`,
          },
        ],
      });
    });
});

//Edita um usuário
router.put('/', async (req, res) => {
  let dados = req.body;
  const hashedPassword = await bcrypt.hash(req.body.senha, 10);
  dados.senha = hashedPassword;
  await Usuario.findByIdAndUpdate(
    req.body._id,
    {
      $set: dados,
    },
    { new: true },
  )
    .then((usuario) => {
      res.send({ message: `Usuarios ${usuario.nome} alterado com sucesso!` });
    })
    .catch((err) => {
      return res.status(500).send({
        erros: [
          {
            message: `Não foi possível alterar o usuário com o id ${req.body._id}, erro${err}`,
          },
        ],
      });
    });
});

module.exports = router;
