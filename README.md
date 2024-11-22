# AluraInstaBack - Backend para Clone do Instagram

Este é um projeto backend que implementa funcionalidades similares ao Instagram, permitindo upload de imagens e criação de posts.

## 🚀 Tecnologias Utilizadas

- Node.js
- Express.js
- MongoDB
- Multer (para upload de arquivos)
- Dotenv (para variáveis de ambiente)

## 📁 Estrutura do Projeto

```
AluraInstaBack/
├── src/
│   ├── controllers/    # Controladores da aplicação
│   │   └── postsController.js
│   ├── models/        # Modelos de dados
│   │   └── postsModel.js
│   └── routes/        # Definição das rotas
│       └── postsRouter.js
├── uploads/          # Pasta onde as imagens são armazenadas
├── .env             # Variáveis de ambiente
├── .gitignore       # Arquivos ignorados pelo git
├── package.json     # Dependências e scripts
└── server.js        # Arquivo principal do servidor
```

## 🛠️ Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Configure as variáveis de ambiente no arquivo `.env`:
```env
STRING_CONEXAO=sua_string_de_conexao_mongodb
NOME_BANCO=nome_do_seu_banco
PORTA=3000
```

## 🔥 Endpoints da API

### Posts

#### GET /posts
- Retorna todos os posts cadastrados
- Resposta: Lista de posts com imagens e descrições

#### POST /posts
- Cria um novo post
- Corpo da requisição:
```json
{
  "descricao": "Descrição do post",
  "imgUrl": "URL da imagem",
  "alt": "Texto alternativo da imagem"
}
```

#### POST /posts/upload
- Faz upload de uma imagem e cria um novo post
- Corpo da requisição (form-data):
  - imagem: arquivo de imagem
  - descricao: (opcional) descrição do post
  - alt: (opcional) texto alternativo da imagem

## 📝 Fluxo da Aplicação

1. **Inicialização**
   - O servidor é iniciado em `server.js`
   - Conexão com MongoDB é estabelecida
   - Middlewares são configurados (express.json, etc.)

2. **Roteamento**
   - Requisições são direcionadas para `PostsRouter.js`
   - Rotas específicas são mapeadas para controladores

3. **Upload de Imagens**
   - Multer processa o upload
   - Imagem é salva na pasta `uploads/`
   - Referência é salva no MongoDB

4. **Gerenciamento de Posts**
   - Posts são armazenados no MongoDB
   - Cada post contém: descrição, URL da imagem e texto alternativo
   - Imagens físicas ficam na pasta `uploads/`

## 🚦 Como Usar

1. Inicie o servidor:
```bash
npm start
```

2. Para fazer upload de uma imagem:
   - Use o Postman ou similar
   - POST para `localhost:3000/posts/upload`
   - Use form-data com campo 'imagem'
   - Adicione descrição e alt (opcionais)

3. Para criar um post sem upload:
   - POST para `localhost:3000/posts`
   - Envie JSON com descricao, imgUrl e alt

4. Para listar todos os posts:
   - GET para `localhost:3000/posts`

## ⚠️ Requisitos

- Node.js 14+
- MongoDB
- NPM ou Yarn

## 📄 Licença

Este projeto está sob a licença MIT.

## 🚀 Funcionalidades

- Upload de imagens
- Criação de posts
- Listagem de posts
- Gerenciamento automático de arquivos
- Sistema de nomeação único baseado em IDs do MongoDB

## 💻 Tecnologias

- Node.js
- Express.js
- MongoDB
- Multer (para upload de arquivos)
- Dotenv (para variáveis de ambiente)

## 🔧 Endpoints da API

### Upload de Imagem
- **POST** `/posts/upload`
- Aceita form-data com campo 'imagem'
- Suporta formatos: jpg, jpeg, png, gif, webp
- Limite de tamanho: 5MB
- Retorna detalhes do arquivo e post criado
- O nome do arquivo salvo será o ID gerado pelo MongoDB

### Criar Post Manual
- **POST** `/posts`
- Corpo da requisição:
```json
{
    "descricao": "Descrição do post",
    "imgUrl": "URL da imagem",
    "alt": "Texto alternativo"
}
```

### Listar Posts
- **GET** `/posts`
- Retorna todos os posts cadastrados

## 📝 Detalhes Técnicos

### Sistema de Arquivos
- As imagens são salvas com o ID do MongoDB como nome
- Formato: `[ID_MONGODB].[extensão]`
- Exemplo: `64f5e7a1b2c3d4e5f6g7h8.jpg`

### Tratamento de Erros
- Validação de tipos de arquivo
- Limpeza automática em caso de falha
- Rollback do banco de dados se o upload falhar

## 🚀 Como Executar

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`
