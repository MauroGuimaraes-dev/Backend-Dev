// Classe que gerencia todas as operações de banco de dados relacionadas aos posts
class PostModel {
    // Construtor que inicializa o modelo com uma conexão ao banco
    constructor(db) {
        // Armazena a referência para a coleção 'posts' do MongoDB
        this.collection = db.collection('posts');
    }

    // Método que retorna todos os posts ordenados por data de criação
    async buscarTodos() {
        try {
            // Executa a consulta no MongoDB:
            // find() - busca todos os documentos
            // sort() - ordena por data de criação (mais recentes primeiro)
            // toArray() - converte o cursor em array de documentos
            return await this.collection.find().sort({ createdAt: -1 }).toArray();
        } catch (erro) {
            // Registra o erro detalhado no console
            console.error('Erro ao buscar posts no banco:', erro);
            // Lança um erro com mensagem mais amigável
            throw new Error('Erro ao buscar posts no banco de dados');
        }
    }

    // Método que busca um post específico pelo seu ID
    async buscarPorId(id) {
        try {
            // Busca um único documento que corresponda ao ID fornecido
            return await this.collection.findOne({ _id: id });
        } catch (erro) {
            // Registra o erro incluindo o ID que causou o problema
            console.error(`Erro ao buscar post com ID ${id}:`, erro);
            // Lança um erro com mensagem mais amigável
            throw new Error('Erro ao buscar post específico');
        }
    }

    // Método que cria um novo post no banco de dados
    async criar(postData) {
        try {
            // Adiciona a data de criação ao objeto do post
            const novoPost = {
                ...postData,           // Mantém todos os dados originais (descricao, imgUrl, alt)
                createdAt: new Date()  // Adiciona a data atual
            };

            // Insere o documento na coleção e retorna o resultado
            return await this.collection.insertOne(novoPost);
        } catch (erro) {
            // Registra o erro detalhado incluindo os dados que causaram o problema
            console.error('Erro ao criar post:', erro, postData);
            // Lança um erro com mensagem mais amigável
            throw new Error('Erro ao criar novo post no banco de dados');
        }
    }

    // Método que atualiza um post existente
    async atualizar(id, postData) {
        try {
            // Atualiza o documento com os novos dados
            // $set - operador do MongoDB que atualiza apenas os campos especificados
            return await this.collection.updateOne(
                { _id: id },           // Filtro: documento com o ID especificado
                { $set: postData }     // Dados a serem atualizados
            );
        } catch (erro) {
            // Registra o erro detalhado incluindo o ID e dados que causaram o problema
            console.error(`Erro ao atualizar post ${id}:`, erro, postData);
            // Lança um erro com mensagem mais amigável
            throw new Error('Erro ao atualizar post');
        }
    }

    // Método que remove um post do banco de dados
    async remover(id) {
        try {
            // Remove o documento com o ID especificado
            return await this.collection.deleteOne({ _id: id });
        } catch (erro) {
            // Registra o erro detalhado incluindo o ID que causou o problema
            console.error(`Erro ao remover post ${id}:`, erro);
            // Lança um erro com mensagem mais amigável
            throw new Error('Erro ao remover post');
        }
    }
}

// Exporta a classe para uso em outras partes da aplicação
export default PostModel;
