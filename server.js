// Importa o framework Express para criar e configurar o servidor web
import express from 'express';
// Importa o cliente MongoDB para conexão com o banco de dados
import { MongoClient, ObjectId } from 'mongodb';
// Importa o router que contém todas as rotas relacionadas a posts
import postsRouter from './src/routes/postsRouter.js';
// Importa e configura o dotenv para variáveis de ambiente
import * as dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import fs from 'fs/promises';

// Cria uma nova instância do aplicativo Express
const app = express();

// Habilita o middleware para processar requisições com corpo em JSON
app.use(express.json());

// Habilita o middleware para servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static('uploads'));
app.use(express.static('uploads')); // Nova linha para servir arquivos estáticos diretamente

// Variável que armazenará a conexão com o MongoDB
let client;
// Variável que armazenará a referência ao banco de dados específico
let db;

// Função assíncrona que estabelece a conexão com o MongoDB Atlas
async function conectarAoBanco() {
    try {
        // Log do início do processo de conexão
        console.log('Iniciando conexão com o MongoDB Atlas...');
        
        // Cria uma nova instância do cliente MongoDB com a string de conexão das variáveis de ambiente
        client = new MongoClient(process.env.STRING_CONEXAO);
        
        // Estabelece a conexão efetiva com o MongoDB
        await client.connect();
        
        // Log de sucesso na conexão
        console.log('Conectado ao MongoDB Atlas com sucesso!');
        
        // Seleciona o banco de dados específico usando o nome das variáveis de ambiente
        db = client.db(process.env.NOME_BANCO);
        
        // Armazena a referência do banco nos locais da aplicação para uso global
        app.locals.db = db;
        
        // Retorna a referência do banco para uso opcional
        return db;
    } catch (erro) {
        // Log detalhado do erro em caso de falha na conexão
        console.error('Erro ao conectar ao MongoDB Atlas:', erro);
        // Encerra o processo com código de erro
        process.exit(1);
    }
}

// Função assíncrona que obtém a versão do MongoDB em uso
async function getMongoDBVersion() {
    try {
        // Executa o comando buildInfo para obter informações do servidor
        const buildInfo = await db.command({ buildInfo: 1 });
        // Retorna a versão do MongoDB
        return buildInfo.version;
    } catch (erro) {
        // Log do erro em caso de falha
        console.error('Erro ao obter versão do MongoDB:', erro);
        // Retorna uma mensagem de erro amigável
        return 'Versão não disponível';
    }
}

// Rota básica para verificar se o servidor está funcionando
app.get('/', (req, res) => {
    // Retorna mensagem simples confirmando que o servidor está online
    res.json({ message: 'Servidor está rodando!' });
});

// Rota que retorna a versão atual do MongoDB
app.get('/version', async (req, res) => {
    try {
        // Obtém a versão do MongoDB
        const version = await getMongoDBVersion();
        // Retorna a versão em formato JSON
        res.json({ mongoVersion: version });
    } catch (erro) {
        // Em caso de erro, retorna status 500 com detalhes
        res.status(500).json({ 
            error: 'Erro ao obter versão do MongoDB',
            details: erro.message 
        });
    }
});

// Rota para atualizar um post existente com nova imagem
app.put('/upload/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const novoPost = req.body;

        // Verifica se o ID é válido
        if (!id) {
            return res.status(400).json({ error: 'ID não fornecido' });
        }

        // Verifica se há dados para atualização
        if (!novoPost) {
            return res.status(400).json({ error: 'Dados para atualização não fornecidos' });
        }

        const resultado = await atualizarNovoPost(id, novoPost, db);
        res.json(resultado);
    } catch (erro) {
        console.error('Erro ao atualizar post:', erro);
        res.status(500).json({ 
            error: 'Erro ao atualizar post',
            details: erro.message 
        });
    }
});

// Função para atualizar um post existente
async function atualizarNovoPost(id, novoPost, db) {
    try {
        // Converte o ID string para ObjectId do MongoDB
        const objectId = ObjectId.createFromHexString(id);

        // Verifica se o post existe
        const postExistente = await db.collection('posts').findOne({ _id: objectId });
        if (!postExistente) {
            throw new Error('Post não encontrado');
        }

        // Remove a imagem antiga se existir e houver uma nova imagem
        if (postExistente.imagemUrl && novoPost.imagemUrl && postExistente.imagemUrl !== novoPost.imagemUrl) {
            const caminhoImagemAntiga = path.join('uploads', path.basename(postExistente.imagemUrl));
            try {
                await fs.promises.unlink(caminhoImagemAntiga);
                console.log(`Imagem antiga removida: ${caminhoImagemAntiga}`);
            } catch (erroRemocao) {
                console.warn('Aviso: Não foi possível remover a imagem antiga:', erroRemocao);
            }
        }

        // Atualiza o post no banco de dados usando o ObjectId
        const resultado = await db.collection('posts').updateOne(
            { _id: objectId },
            { $set: novoPost }
        );

        if (resultado.modifiedCount === 0) {
            throw new Error('Nenhuma modificação foi feita no post');
        }

        return {
            message: 'Post atualizado com sucesso',
            id: id,
            modificacoes: resultado.modifiedCount
        };
    } catch (erro) {
        throw new Error(`Erro ao atualizar post: ${erro.message}`);
    }
}

// Registra o router de posts para lidar com todas as requisições em /posts
app.use('/posts', postsRouter);

// Função principal que inicializa o servidor
async function iniciarServidor() {
    try {
        // Estabelece a conexão com o banco de dados
        await conectarAoBanco();
        
        // Define a porta do servidor usando variável de ambiente ou 3000 como padrão
        const porta = process.env.PORTA || 3000;
        
        // Inicia o servidor na porta especificada
        app.listen(porta, () => {
            console.log(`Servidor rodando na porta ${porta}`);
            console.log(`Acesse: http://localhost:${porta}`);
        });
    } catch (erro) {
        // Log detalhado em caso de erro na inicialização
        console.error('Erro ao iniciar o servidor:', erro);
        // Encerra o processo com código de erro
        process.exit(1);
    }
}

// Configura o tratamento para quando o servidor for encerrado (Ctrl+C)
process.on('SIGINT', async () => {
    try {
        // Verifica se existe uma conexão ativa com o MongoDB
        if (client) {
            // Fecha a conexão com o MongoDB
            await client.close();
            console.log('Conexão com MongoDB fechada');
        }
        // Log de encerramento do servidor
        console.log('Servidor encerrado');
        // Encerra o processo com sucesso
        process.exit(0);
    } catch (erro) {
        // Log de erro ao tentar encerrar o servidor
        console.error('Erro ao encerrar o servidor:', erro);
        // Encerra o processo com código de erro
        process.exit(1);
    }
});

// Inicia o servidor
iniciarServidor();