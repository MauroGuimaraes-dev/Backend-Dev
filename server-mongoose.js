import express from "express";
import mongoose from 'mongoose';
import conectarAoBanco from './src/config/dbConfig.js';

// Define o esquema do Post
const postSchema = new mongoose.Schema({
    descricao: {
        type: String,
        required: true
    },
    imagem: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Cria o modelo Post
const Post = mongoose.model('Post', postSchema);

const app = express();
app.use(express.json());

// Função para obter a versão do MongoDB
async function getMongoDBVersion(conexao) {
    try {
        const admin = conexao.connection.db.admin();
        const serverInfo = await admin.serverInfo();
        return serverInfo.version;
    } catch (erro) {
        console.error('Erro ao obter versão do MongoDB:', erro);
        return 'Versão não disponível';
    }
}

// Função para obter todos os posts do banco
async function getTodosPosts() {
    try {
        return await Post.find().sort({ createdAt: -1 });
    } catch (erro) {
        console.error('Erro ao buscar posts:', erro);
        throw erro;
    }
}

// Rota para obter a versão do MongoDB
app.get('/version', async (req, res) => {
    try {
        const version = await getMongoDBVersion(mongoose);
        res.json({ mongoVersion: version });
    } catch (erro) {
        res.status(500).json({ 
            error: 'Erro ao obter versão do MongoDB',
            details: erro.message
        });
    }
});

// Rota para obter todos os posts
app.get('/posts', async (req, res) => {
    try {
        const posts = await getTodosPosts();
        res.json(posts);
    } catch (erro) {
        console.error('Erro ao buscar posts:', erro);
        res.status(500).json({ error: 'Erro ao buscar posts' });
    }
});

// Inicialização do servidor
async function iniciarServidor() {
    try {
        // Conecta ao banco
        await conectarAoBanco(process.env.STRING_CONEXAO);
        
        // Inicia o servidor
        app.listen(3000, async () => {
            console.log('Server is running on port 3000');
            console.log('Acesse http://localhost:3000/posts para ver os posts');
            // Mostra a versão do MongoDB quando o servidor iniciar
            await getMongoDBVersion(mongoose);
        });
    } catch (erro) {
        console.error('Erro ao iniciar o servidor:', erro);
        process.exit(1);
    }
}

iniciarServidor();