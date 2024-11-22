// Importa o Mongoose, biblioteca ODM (Object Document Mapper) para MongoDB
import mongoose from 'mongoose';

// Função assíncrona que estabelece conexão com o MongoDB Atlas
export default async function conectarAoBanco(stringConexao) {
    try {
        // Log do início do processo de conexão
        console.log('Iniciando conexão com o MongoDB Atlas...');
        console.log('Configurando opções de conexão...');
        
        // Define as opções de conexão recomendadas pelo MongoDB
        const options = {
            // Usa o novo parser de URL do MongoDB
            useNewUrlParser: true,
            // Usa o novo motor de gerenciamento de topologia
            useUnifiedTopology: true,
            // Define timeout de 15 segundos para seleção de servidor
            serverSelectionTimeoutMS: 15000,
            // Define timeout de 30 segundos para conexão
            connectTimeoutMS: 30000,
            // Define timeout de 30 segundos para socket
            socketTimeoutMS: 30000,
            // Habilita SSL/TLS para conexão segura
            ssl: true,
            // Especifica a fonte de autenticação
            authSource: 'admin'
        };

        // Estabelece a conexão com o MongoDB usando a string de conexão e opções
        await mongoose.connect(stringConexao, options);
        
        // Log de sucesso na conexão
        console.log('Conectado ao MongoDB Atlas com sucesso!');
        
        // Retorna a instância do mongoose para uso em outras partes da aplicação
        return mongoose;
    } catch (erro) {
        // Log detalhado em caso de erro na conexão
        console.error('Erro ao conectar ao MongoDB:', erro);
        // Propaga o erro para tratamento superior
        throw erro;
    }
}