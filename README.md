# API-PSEL

Api desenvolvida para servir de backend para a aplicação front-end, utilizando do NodeJs, Express e mongoose em sua maioria.

## Utilização

Para rodar o projeto é necessário o NodeJS, express, mongoose e se preferir o nodemon. Vá ao diretório de preferência, clone o projeto e rode npm install para instalar as dependências necessárias , renomeie o .env copy para .env e insira sua string de Conexão do MongoDB.

## Ferramentas

NodeJs

- ExpressJs
- Mongoose
- Multer
- JsonWebToken

## Features

O projeto consiste em um sistema onde o usuário se cadastra(como usuario como por default), efetua seu login e tem acesso a um dashboard de acordo com seu nível de acesso no sistema, definido pelo administrador. Caso o usuário tenha nível de acesso de administrador ele tem acesso a todos os usuários cadastrados, podendo edita-los ou desativa-los.
