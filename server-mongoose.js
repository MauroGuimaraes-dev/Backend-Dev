// Importa o framework Express para criar o servidor web
import express from "express";
// Importa o Mongoose para modelagem de dados MongoDB
import mongoose from 'mongoose';
// Importa a função de conexão com o banco de dados
import conectarAoBanco from './src/config/dbConfig.js';

// Define o esquema do Post usando Mongoose
const postSchema = new mongoose.Schema({
    // Campo de descrição do post (obrigatório)
    descricao: {
        type: String,
        required: true
    },
    // Campo para URL da imagem (obrigatório)
    imagem: {
        type: String,
        required: true
    },
    // Data de criação do post (automática)
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Cria o modelo Post baseado no esquema
const Post = mongoose.model('Post', postSchema);

// Cria uma instância do aplicativo Express
const app = express();
// Configura o Express para processar JSON
app.use(express.json());

// Função assíncrona para obter a versão do MongoDB
async function getMongoDBVersion(conexao) {
    try {
        // Executa comando para obter informações do servidor
        const admin = conexao.connection.db.admin();
        const serverInfo = await admin.serverInfo();
        // Retorna a versão do MongoDB
        return serverInfo.version;
    } catch (erro) {
        // Log de erro em caso de falha
        console.error('Erro ao obter versão do MongoDB:', erro);
        // Retorna mensagem amigável em caso de erro
        return 'Versão não disponível';
    }
}

// Função assíncrona para buscar todos os posts
async function getTodosPosts() {
    try {
        // Busca todos os posts ordenados por data de criação (mais recentes primeiro)
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
    } catch (erro) {
        // Log de erro em caso de falha
        console.error('Erro ao buscar posts:', erro);
        throw erro;
    }
}

// Rota para obter a versão do MongoDB
app.get('/version', async (req, res) => {
    try {
        // Obtém a versão do MongoDB
        const version = await getMongoDBVersion(mongoose);
        // Retorna a versão em formato JSON
        res.json({ mongoVersion: version });
    } catch (erro) {
        // Log de erro em caso de falha
        console.error('Erro ao obter versão:', erro);
        // Retorna erro 500 com mensagem amigável
        res.status(500).json({ erro: 'Erro ao obter versão do MongoDB' });
    }
});

// Rota para buscar todos os posts
app.get('/posts', async (req, res) => {
    try {
        // Busca todos os posts usando a função auxiliar
        const posts = await getTodosPosts();
        // Retorna os posts em formato JSON
        res.json(posts);
    } catch (erro) {
        // Log de erro em caso de falha
        console.error('Erro ao buscar posts:', erro);
        // Retorna erro 500 com mensagem amigável
        res.status(500).json({ erro: 'Erro ao buscar posts' });
    }
});

// Função principal que inicializa o servidor
async function iniciarServidor() {
    try {
        // Primeiro estabelece conexão com o banco de dados
        await conectarAoBanco(process.env.STRING_CONEXAO);
        
        // Define a porta do servidor
        const porta = 3000;
        // Inicia o servidor na porta especificada
        app.listen(porta, async () => {
            // Log confirmando que o servidor está rodando
            console.log(`Servidor rodando na porta ${porta}`);
            // Log com URL para acessar os posts
            console.log(`Acesse http://localhost:${porta}/posts para ver os posts`);
            // Obtém e exibe a versão do MongoDB
            const version = await getMongoDBVersion(mongoose);
            console.log(`Versão do MongoDB: ${version}`);
        });
    } catch (erro) {
        // Log de erro em caso de falha
        console.error('Erro ao iniciar servidor:', erro);
        // Encerra o processo com código de erro
        process.exit(1);
    }
}

// Inicia o servidor
iniciarServidor();