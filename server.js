import express from 'express';

const posts = [
        {
            id: 1,
            descrição : 'Descrição do Post 1', 
            imagem : 'https://placecats.com/millie/300/150'
        },
        {
            id: 2,
            descrição: 'Este é o segundo post, com uma imagem diferente.',
            imagem: 'https://picsum.photos/id/237/300/200'
        },
        {
            id: 3,
            descrição: 'Um post mais longo, com uma imagem mais detalhada.',
            imagem: 'https://source.unsplash.com/random/300x200'
        },
        {
            id: 4,
            descrição: 'Post sobre gatos fofinhos!',
            imagem: 'https://placekitten.com/300/200'
        },
        {
            id: 5,
            descrição: 'Um post sobre paisagens naturais.',
            imagem: 'https://unsplash.com/photos/nature'
        },
        {
            id: 6,
            descrição: 'Post sobre comida deliciosa.',
            imagem: 'https://unsplash.com/s/food'
        },
    ];

    
const app = express();
app.use(express.json());

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.get('/posts', (req, res) => {
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