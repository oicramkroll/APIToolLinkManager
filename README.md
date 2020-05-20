# Tool link manager

Projeto para gerenciamento de links de ferramentas, seguida de pesquisa de tags.

Para gerenciar os links é necessário efetuar a autenticação vai JWT.

## banco de dados e migrations.
Foi utilizado o sqlite para facil implementação mas pode ser utilizado qualquer banco por que utilizo o prisma 2 para gerar as migrations.

## Variaveis de ambientes 


    MAIL_HOST
    MAIL_PORT
    MAIL_USER
    MAIL_PASSWORD

    DATABASE_URL

## Instalação do projeto 

crie um arquivo <code>.env</code> na pasta raiz do projeto e informe as variaveis de ambiente citadas no topico anterior e execute os segintes comandos:

    npm install
    npm install @prisma/cli --save-dev
    prisma migrate save --experimental
    prisma migrate up --experimental

## Principais libs

[json web token](https://github.com/auth0/node-jsonwebtoken#readme)

[node mailer](https://nodemailer.com/about/)

[Prisma 2](https://nodemailer.com/about/)

## Documentação da API
[OpenApi 3 - SwaggerHub](https://app.swaggerhub.com/apis/oicramkroll/api-title/1.0-oas3)

