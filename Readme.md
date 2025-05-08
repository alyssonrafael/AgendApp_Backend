# 🧠 Back-end – [AgendApp]

Este repositório contém a implementação da API do Projeto **AgendApp**, um sistema completo de agendamento e gerenciamento de serviços, desenvolvido com foco em escalabilidade, segurança e organização.

A API foi construída utilizando **Node.js**, **TypeScript**, **Prisma ORM** e **PostgreSQL**, oferecendo suporte a funcionalidades como:

- Registro e autenticação de clientes e empresas
- Login com e-mail/senha e integração com Google (OAuth2)
- Recuperação de senha por e-mail
- Agendamento de serviços entre usuários e prestadores
- Suporte a tokens JWT e validações seguras
- Possibilidade de subir imagens para serem renderizadas no frontend

> Este projeto nasceu como um trabalho acadêmico, mas evoluiu com o tempo e hoje serve como base para um produto real, com arquitetura sólida e boas práticas de desenvolvimento back-end. Para saber mais sobre o font é só clicar [neste link](https://github.com/alyssonrafael/AgendApp_Frontend).

## 🚀 Tecnologias Utilizadas

[![My Skills](https://skillicons.dev/icons?i=ts,nodejs,express,postgres,prisma,docker,)](https://skillicons.dev)

---

## 📁 Estrutura Principal do Projeto

- 📦 **Prisma/**

  - 📂 `migrations/` – Migrações geradas automaticamente para o banco de dados
  - 📜 `schema.prisma` – Schema principal do Prisma, define os modelos e conexão com o banco
- 📦 **src/**

  - 📂 `config/` – config do passport do oauth2.0 e o multer para cofiguração de parametros para imagens enviadas do front
  - 📂 `controllers/` – Funções que lidam com as requisições e respostas da API
  - 📂 `middlewares/` – Middlewares de autenticação, validação e afins
  - 📂 `routes/` – Definição das rotas da aplicação
  - 📂 `services/` – Regras de negócio e lógica de processamento
  - 📂 `uploads/` – pasta que ficam as imagens da empresa, gerada automaticamente ao iniciar pela primeira vez
  - 📂 `utils/` – Funções utilitárias e helpers reutilizáveis
  - 📜 `index.ts` – Ponto de entrada da aplicação (inicializa o servidor)
  - 📜 `prisma.ts` – Instância única do Prisma Client para uso no projeto
  - 📜 `seed.ts` – Script para popular o banco de dados com dados iniciais (seeds)
- 📜 `.env.example` – Arquivo modelo com as variáveis de ambiente necessárias
- 📜 `docker-compose.exampel.yml` – Exemplo do arquivo de configuração do Docker (subir banco de dados)
- 📜 `package.json` – Gerenciador de dependências e scripts do projeto

---

## ⚙️ Configuração do Ambiente

A seguir estão as instruções para rodar o projeto localmente em ambiente de desenvolvimento. Certifique-se de ter o Node.js instalado em sua máquina. Com os passos abaixo, você será capaz de instalar as dependências, configurar as variáveis de ambiente, subir o banco de dados, aplicar as migrações, popular o banco e iniciar o servidor da aplicação.

### 1. Clonar o repositório

Clone o projeto com o comando:

```bash
git clone https://github.com/alyssonrafael/AgendApp_Backend
```

### 2. Entar no diretorio Backend

Navegue para o diretorio backend

```bash
cd AgendApp_Backend
```

### 3. Instalar as dependências

Execute o comando:

```bash
npm install
```

### 4. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` com o comando:

```bash
cp .env.example .env
```

Em seguida, edite o `.env` com suas configurações locais, principalmente os dados de conexão com o banco. **Essa etapa é muito inportante**.

**ℹ️ Dica:** Assegure-se de utilizar um banco de dados de teste para rodar o projeto localmente.
Caso ainda não tenha um ambiente configurado.

Copie o arquivo `docker-compose.example.yml` para `docker-compose.yml` com o comando:

```bash
cp docker-compose.example.yml docker-compose.yml
```

**ℹ️ Dica:** Assegure-se de configurar corretamente as variaveis de ambiente do .env para que a configuração do banco ocorra corretamente.

Você pode seguir o passo abaixo para subir um banco de dados com Docker:

## 🐳 Subindo o Banco com Docker

Certifique-se de que o **Docker e o Docker-compose** esteja instalado e rodando.

Execute o comando:

```bash
docker-compose up -d
```

Isso criará e executará o container PostgreSQL com base nas configurações do seu `.env e do docker-compose`.

---

## 🛠️ Prisma – Configuração e Migração

Com o banco de dados rodando, use o comando abaixo para criar a estrutura inicial do banco:

```bash
npx prisma migrate dev
```

Se quiser visualizar o banco via interface gráfica, execute:

```bash
npx prisma studio
```

Feito isso, seu banco de dados já estará rodando e configurado.
Se desejar popular com dados fictícios iniciais, siga o próximo passo:

---

## 🌱 Populando o Banco (Seed)

Você pode utilizar os scripts definidos no `package.json`:

- Para **resetar** o banco **(Atenção esse comando apaga todos os dados do banco de dados)**:

```bash
npm run db:reset
```

- Para **popular** o banco com dados ficticios iniciais (seeds):

```bash
npm run db:seed
```

---

## 🧪 Rodando o Projeto em Desenvolvimento

Para iniciar o servidor de desenvolvimento, rode:

```bash
npm run dev
```

A API estará disponível em `http://localhost:3333` (ou na porta configurada no `.env`).

---

## ✅ Observações

⚠️ **Importante:** Este projeto foi desenvolvido especificamente para o AgendApp

🔐 Todas as variáveis sensíveis estão isoladas no arquivo `.env`.
Certifique-se de configurar corretamente seu `.env` (a partir do `.env.example`) antes de iniciar o projeto, para garantir que tudo funcione como esperado.

## 📌 Endpoints da API

O inicio do endpoit é sempre o mesmo `http://localhost:3333/api` (ou na porta configurada no `.env`).

### Rotas de autenteicação

| Método | Rota                       | Descrição                                                         |
| ------- | -------------------------- | ------------------------------------------------------------------- |
| POST    | `/auth/register/user`    | Registra um novo usuário                                           |
| POST    | `/auth/login/user`       | Realiza login e retorna um token JWT                                |
| GET     | `/auth/google`           | Realiza o Login com o google essa rota chama o passport.autenticate |
| POST    | `/auth/register/company` | Registra uma nova empresa                                           |
| POST    | `/auth/login/company`    | Realiza login da empresa e retorna um token JWT                     |
| POST    | `/auth/forgot-password`  | Realiza chamada para mandar o email de recuperação da senha       |
| POST    | `/auth/reset-password`   | Recuperação da senha com o token recebido pelo email.             |

### Rotas das empresas (algumas são usadas por usuarios)

##### listagem de empresas geral

| Método | Rota               | Descrição                                                                              |
| ------- | ------------------ | ---------------------------------------------------------------------------------------- |
| GET     | `/companies`     | Lista todas as empresas cadastradas                                                      |
| GET     | `/companies/:id` | Lista empresa especifica com base no id e retorna os serviços associados a essa empresa |

##### Informações da empresa

| Método | Rota                     | Descrição                                                                                     |
| ------- | ------------------------ | ----------------------------------------------------------------------------------------------- |
| PUT     | `/update/company`      | Atualiza informações da empresa de forma individual. Basta passar oque será alterado no body |
| POST    | `/company/upload-foto` | Realiza o upload de imagem para o perfil da empresa sendo possivel apenas 1 imagem por empresa  |

##### serviços da empresa

| Método | Rota                             | Descrição                                                                            |
| ------- | -------------------------------- | -------------------------------------------------------------------------------------- |
| POST    | `/servicos`                    | Cria um novo serviço na empresa                                                       |
| GET     | `/servicos/meus-servicos`      | Lista todos os serviços da empresa logada                                             |
| GET     | `/servicos/empresa/:empresaId` | Lista os serviços ativos da empresa fornecida pelo Id                                 |
| GET     | `/servicos/:id`                | Lista um serviço especifico com base no Id                                            |
| PUT     | `/servicos/:id`                | Atualiza um serviço especificom com base no Id altera de forma individual cada campo. |
| PUT     | `/servicos/:id/inativar`       | Realiza o soft delet do serviço deixa ele como inativo                                |
| PUT     | `/servicos/:id/ativar`         | Desfaz o soft delet e ativa o serviço                                                 |

##### Grade de Horários da empresa

| Método | Rota                                                 | Descrição                                                                   |
| ------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| POST    | `/grade-horario`                                   | Cria uma nova grade de horaios para o dia especifico da semana para a empresa |
| PUT     | `/grade-horario/:id`                               | Atualiza uma grade especifica mudando inicio fim e intervalo entre os horrios |
| GET     | `/horarios-disponiveis?empresaId="id"&data="data"` | Lista os horarios da empresa para determinado dia                             |
| GET     | `/horarios-disponiveis-empresa?data=2025-04-05`    | Lista os horarários disponiveis da empresa logada para determinado dia       |
| POST    | `/grade-horario/adicionar-dias`                    | Adiciona dia da semana a grade com horario padrão                            |
| PUT     | `/grade-horario/atualizar-horarios`                | atualiza os horarios da grade globalmente todos os dias com o mesmo horário  |
| DELETE  | `/grade-horario/remover-dia`                       | Deleta um dia de atendimento da grade                                         |
| POST    | `/indisponibilidade/criar`                         | Cria uma nova indisponibilidade global ou pontual                             |
| GET     | `/indisponibilidade-empresa`                       | Lista as indisponibilidades da emoresa logada                                 |
| DELETE  | `/indisponibilidade/remover`                       | Deleta uma indisponibilidade especifica. ID enviado no body                   |

### Rotas do Usuario

| Método | Rota             | Descrição                                                                                    |
| ------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| GET     | `/userPerfil`  | Lista informações basicas do usuario logado                                                  |
| PUT     | `/update/user` | Atualiza informaões do usuario logado. As informações podem ser atualizadas individualmente |

### Rotas de Agendamento

| Método | Rota                                          | Descrição                                                                               |
| ------- | --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| POST    | `/agendar`                                  | Cria um novo agendamento com base no id do serviço e do usuario que e resgatado do token |
| GET     | `/meus-agendamentos`                        | Lista os agendamentos do usuario logado                                                   |
| GET     | `/meus-agendamentos-futuros`                | Lista apenas os agendamentos futuros do usuario logado                                    |
| GET     | `/meus-agendamentos-dia`                    | Lista apenas os agendamentos do dia do usuario logado                                     |
| GET     | `/agendamentos-empresar`                    | Lista todos os agendamentos pertencentes a empresa logada                                 |
| GET     | `/agendamentos-empresa-futuro`              | Lista apenas os agendamentos futuros pertencentes a empresa logada                        |
| GET     | `/agendamentos-empresa-dia`                 | Lista apenas os agendamentos do dia pertencentes a empresa logada                         |
| DELETE  | `/meus-agendamentos-excluir/:agendamentoId` | Deleta o agendamento com base no id. apenas o proprietario desse agendamento pode excluir |

### 🔒 Todas as rotas (exceto as de auth) requerem autenticação via token JWT.

O token deve ser enviado no **header** `Authorization`, contendo **apenas o token** (sem o prefixo `Bearer`).

### 🖼️ A uma pasta publica com todas as imagens de banner das empresas você pode acessar pela url abaixo basta copiar, colar e alterar o nome do arquivo para um correspondente na sua pasta

 `http://localhost:3333/uploads/"nome-do-arquivo-da-imagem"`

