import express from 'express';
import conectarAoBanco from './src/config/dbConfig.js';


// Cria variável de conexão com o banco
const conexao = await conectarAoBanco(process.env.STRING_CONEXAO);

async function getTodosPosts() {
    const db = conexao.db(process.env.NOME_BANCO);
    const colecao = await db.collection('posts');
    return await colecao.find().toArray();
}

    
const app = express();
app.use(express.json());

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.get('/posts', async(req, res) => {
    const posts = await getTodosPosts();
    res.status(200).json(posts);
});

app.get('/posts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const post = posts.find(post => post.id === id);
    
    if (!post) {
        return res.status(404).json({ message: 'Post não encontrado' });
    }
    
    res.status(200).json(post);
});