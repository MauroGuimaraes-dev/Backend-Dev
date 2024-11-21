import express from 'express';
import { MongoClient } from 'mongodb';

const app = express();
app.use(express.json());

let client;
let db;

// Função para conectar ao MongoDB
async function conectarAoBanco() {
    try {
        console.log('Iniciando conexão com o MongoDB Atlas...');
        client = new MongoClient(process.env.STRING_CONEXAO);
        await client.connect();
        console.log('Conectado ao MongoDB Atlas com sucesso!');
        
        db = client.db(process.env.NOME_BANCO);
        console.log(`Conectado ao banco: ${process.env.NOME_BANCO}`);
        
        return db;
    } catch (erro) {
        console.error('Erro na conexão:', erro);
        throw erro;
    }
}

// Função para obter a versão do MongoDB
async function getMongoDBVersion() {
    try {
        const adminDb = client.db('admin');
        const serverStatus = await adminDb.command({ serverStatus: 1 });
        return serverStatus.version;
    } catch (erro) {
        console.error('Erro ao obter versão do MongoDB:', erro);
        return 'Versão não disponível';
    }
}

// Função para buscar todos os posts do banco
async function buscarPosts() {
    try {
        const colecao = db.collection('posts');
        return await colecao.find().sort({ createdAt: -1 }).toArray();
    } catch (erro) {
        console.error('Erro ao buscar posts:', erro);
        throw erro;
    }
}

// Rota para verificar se o servidor está rodando
app.get('/', (req, res) => {
    res.json({ message: 'Servidor está rodando!' });
});

// Rota para retornar a versão do MongoDB
app.get('/version', async (req, res) => {
    try {
        const version = await getMongoDBVersion();
        res.json({ mongoVersion: version });
    } catch (erro) {
        res.status(500).json({ 
            error: 'Erro ao obter versão do MongoDB',
            details: erro.message 
        });
    }
});

// Rota para retornar todos os posts
app.get('/posts', async (req, res) => {
    try {
        const posts = await buscarPosts();
        res.status(200).json(posts);
    } catch (erro) {
        console.error('Erro na rota /posts:', erro);
        res.status(500).json({ erro: 'Erro ao buscar posts' });
    }
});

// Inicialização do servidor
async function iniciarServidor() {
    try {
        await conectarAoBanco();
        
        const porta = 3000;
        app.listen(porta, async () => {
            console.log(`Servidor rodando na porta ${porta}`);
            console.log(`Acesse http://localhost:${porta}/posts para ver os posts`);
            const version = await getMongoDBVersion();
            console.log(`Versão do MongoDB: ${version}`);
        });
    } catch (erro) {
        console.error('Erro ao iniciar o servidor:', erro);
        process.exit(1);
    }
}

// Tratamento de encerramento do servidor
process.on('SIGINT', async () => {
    try {
        if (client) {
            await client.close();
            console.log('Conexão com o MongoDB fechada');
        }
        process.exit(0);
    } catch (erro) {
        console.error('Erro ao fechar conexão:', erro);
        process.exit(1);
    }
});

iniciarServidor();