// Importa o modelo responsável pelas operações no banco de dados
import PostModel from '../models/postsModel.js';
// Importa crypto para gerar IDs únicos
import crypto from 'crypto';
// Importa fs e path para manipulação de arquivos
import fs from 'fs/promises';
import path from 'path';
import { ObjectId } from 'mongodb';

// Classe que controla as operações relacionadas aos posts
class PostsController {
    // Construtor da classe
    constructor() {
        // Vincula os métodos ao contexto da classe
        this.buscarTodos = this.buscarTodos.bind(this);
        this.criar = this.criar.bind(this);
        this.uploadImagem = this.uploadImagem.bind(this);
        this.atualizar = this.atualizar.bind(this); // Novo método
    }

    // Método que busca e retorna todos os posts cadastrados
    async buscarTodos(req, res) {
        try {
            // Obtém a referência do banco de dados dos locais da aplicação
            const db = req.app.locals.db;
            // Cria uma nova instância do modelo com a conexão do banco
            const postModel = new PostModel(db);
            // Busca todos os posts usando o modelo
            const posts = await postModel.buscarTodos();
            // Retorna os posts encontrados com status 200 (OK)
            res.status(200).json(posts);
        } catch (erro) {
            // Registra o erro no console para debugging
            console.error('Erro ao buscar posts:', erro);
            // Retorna erro 500 com mensagem amigável para o usuário
            res.status(500).json({ erro: 'Erro ao buscar posts' });
        }
    }

    // Método que cria um novo post com dados fornecidos pelo cliente
    async criar(req, res) {
        try {
            // Extrai os campos necessários do corpo da requisição
            const { descricao, imgUrl, alt } = req.body;

            // Validação básica: verifica se todos os campos obrigatórios foram fornecidos
            if (!descricao || !imgUrl || !alt) {
                return res.status(400).json({ 
                    erro: 'Todos os campos são obrigatórios: descricao, imgUrl e alt' 
                });
            }

            // Monta o objeto do post com a estrutura esperada
            const postData = {
                descricao,  // Texto descritivo do post
                imgUrl,     // URL da imagem do post
                alt        // Texto alternativo da imagem para acessibilidade
            };

            // Obtém a referência do banco de dados
            const db = req.app.locals.db;
            // Cria uma nova instância do modelo
            const postModel = new PostModel(db);

            // Insere o post no MongoDB e obtém o resultado
            const resultado = await postModel.criar(postData);

            // Retorna o post criado com seu ID gerado pelo MongoDB
            res.status(201).json({
                ...postData,           // Todos os dados do post
                _id: resultado.insertedId  // ID gerado pelo MongoDB
            });
        } catch (erro) {
            // Registra o erro no console para debugging
            console.error('Erro ao criar post:', erro);
            // Retorna erro 500 com mensagem amigável para o usuário
            res.status(500).json({ erro: 'Erro ao criar post' });
        }
    }

    // Método que cria um post no banco de dados
    async _criarPost(db, postData) {
        // Cria uma nova instância do modelo
        const postModel = new PostModel(db);
        // Insere o post e retorna o resultado
        return await postModel.criar(postData);
    }

    // Método que processa o upload de uma imagem e cria um post associado
    async uploadImagem(req, res) {
        try {
            // Verifica se um arquivo foi enviado na requisição
            if (!req.file) {
                return res.status(400).json({ erro: 'Nenhuma imagem foi enviada' });
            }

            // Obtém a extensão do arquivo original
            const extensao = req.file.originalname.split('.').pop();
            
            // Obtém a referência do banco de dados
            const db = req.app.locals.db;
            
            // Verifica se a conexão com o banco está disponível
            if (!db) {
                console.error('Conexão com banco de dados não disponível');
                return res.status(500).json({ erro: 'Erro de conexão com o banco de dados' });
            }

            // Cria um novo post com os dados temporários da imagem
            const postData = {
                // Usa a descrição fornecida ou um texto padrão
                descricao: req.body.descricao || 'Imagem enviada via upload',
                // Campo temporário para URL, será atualizado após obter o ID
                imgUrl: '',
                // Usa o texto alternativo fornecido ou o nome original do arquivo
                alt: req.body.alt || req.file.originalname,
                // Nome original do arquivo para referência
                nomeOriginal: req.file.originalname
            };

            // Cria o post no banco de dados para obter o ID
            const resultado = await this._criarPost(db, postData);
            // Converte o ObjectId para string para usar como nome do arquivo
            const postId = resultado.insertedId.toString();

            // Constrói o novo nome do arquivo usando o ID do MongoDB
            const novoNomeArquivo = `${postId}.${extensao}`;

            // Constrói os caminhos dos arquivos
            const caminhoTemporario = req.file.path;
            const caminhoDestino = path.join('uploads', novoNomeArquivo);

            try {
                // Renomeia o arquivo para usar o ID do MongoDB como nome
                await fs.rename(caminhoTemporario, caminhoDestino);
                
                // Atualiza as informações do arquivo no objeto da requisição
                req.file.filename = novoNomeArquivo;
                req.file.path = caminhoDestino;

                // Constrói a URL completa da imagem com o novo nome
                const imgUrl = `http://localhost:${process.env.PORTA || 3000}/uploads/${novoNomeArquivo}`;
                
                // Atualiza o post no banco com a URL correta da imagem
                await db.collection('posts').updateOne(
                    { _id: resultado.insertedId },
                    { $set: { imgUrl: imgUrl } }
                );

                // Atualiza o objeto postData para incluir na resposta
                postData.imgUrl = imgUrl;
                postData._id = resultado.insertedId;

            } catch (erroRename) {
                // Registra o erro de renomeação no console
                console.error('Erro ao renomear arquivo:', erroRename);
                // Remove o post do banco em caso de erro para manter consistência
                await db.collection('posts').deleteOne({ _id: resultado.insertedId });
                throw new Error('Erro ao processar arquivo');
            }

            // Retorna resposta de sucesso com detalhes do arquivo e do post
            res.status(200).json({
                mensagem: 'Upload realizado com sucesso',
                arquivo: {
                    id: postId,                // ID do MongoDB usado como nome
                    nome: novoNomeArquivo,     // Nome final do arquivo
                    nomeOriginal: req.file.originalname, // Nome original para referência
                    tamanho: req.file.size,    // Tamanho em bytes
                    tipo: req.file.mimetype,   // Tipo MIME do arquivo
                    caminho: req.file.path     // Caminho onde foi salvo
                },
                post: {
                    ...postData,               // Todos os dados do post
                    _id: resultado.insertedId  // ID do MongoDB
                }
            });
        } catch (erro) {
            // Se houver erro e o arquivo existir, remove-o do sistema
            if (req.file && req.file.path) {
                try {
                    await fs.unlink(req.file.path);
                } catch (erroDelete) {
                    // Registra erro na remoção do arquivo, mas não interrompe o fluxo
                    console.error('Erro ao remover arquivo após falha:', erroDelete);
                }
            }

            // Registra os detalhes do erro no console para debugging
            console.error('Erro no upload da imagem:', erro);
            console.error('Stack trace:', erro.stack);
            
            // Retorna erro 500 com detalhes para o cliente
            res.status(500).json({ 
                erro: 'Erro ao processar upload da imagem',
                detalhes: erro.message,
                tipo: erro.name
            });
        }
    }

    // Método para atualizar um post existente
    async atualizar(req, res) {
        try {
            // Extrai o ID do post dos parâmetros da URL
            const postId = req.params.id;
            
            // Verifica se o ID foi fornecido
            if (!postId) {
                return res.status(400).json({ erro: 'ID do post não fornecido' });
            }

            // Extrai os dados atualizados do corpo da requisição
            const { descricao, imgUrl, alt } = req.body;

            // Verifica se pelo menos um campo para atualização foi fornecido
            if (!descricao && !imgUrl && !alt) {
                return res.status(400).json({ 
                    erro: 'Forneça pelo menos um campo para atualização: descricao, imgUrl ou alt' 
                });
            }

            // Obtém a referência do banco de dados
            const db = req.app.locals.db;
            
            // Verifica se o post existe
            const postExistente = await db.collection('posts').findOne({ 
                _id: new ObjectId(postId) 
            });

            if (!postExistente) {
                return res.status(404).json({ erro: 'Post não encontrado' });
            }

            // Cria o objeto com os campos a serem atualizados
            const dadosAtualizacao = {};
            if (descricao) dadosAtualizacao.descricao = descricao;
            if (imgUrl) dadosAtualizacao.imgUrl = imgUrl;
            if (alt) dadosAtualizacao.alt = alt;

            // Se houver uma nova imagem, remove a antiga
            if (imgUrl && postExistente.imgUrl) {
                const nomeArquivoAntigo = path.basename(postExistente.imgUrl);
                const caminhoArquivoAntigo = path.join('uploads', nomeArquivoAntigo);
                
                try {
                    await fs.access(caminhoArquivoAntigo);
                    await fs.unlink(caminhoArquivoAntigo);
                    console.log(`Arquivo antigo removido: ${caminhoArquivoAntigo}`);
                } catch (erroRemocao) {
                    console.warn('Aviso: Arquivo antigo não encontrado:', erroRemocao.message);
                }
            }

            // Atualiza o post no banco de dados
            const resultado = await db.collection('posts').updateOne(
                { _id: new ObjectId(postId) },
                { $set: dadosAtualizacao }
            );

            // Verifica se algum documento foi modificado
            if (resultado.modifiedCount === 0) {
                return res.status(404).json({ erro: 'Nenhuma modificação realizada' });
            }

            // Busca o post atualizado para retornar
            const postAtualizado = await db.collection('posts').findOne({ 
                _id: new ObjectId(postId) 
            });

            // Retorna o post atualizado
            res.status(200).json({
                mensagem: 'Post atualizado com sucesso',
                post: postAtualizado
            });

        } catch (erro) {
            console.error('Erro ao atualizar post:', erro);
            res.status(500).json({ 
                erro: 'Erro ao atualizar post',
                detalhes: erro.message 
            });
        }
    }
}

// Exporta uma instância única do controller
export default new PostsController();
