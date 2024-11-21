import mongoose from 'mongoose';

export default async function conectarAoBanco(stringConexao) {
    try {
        console.log('Iniciando conexão com o MongoDB Atlas...');
        console.log('Configurando opções de conexão...');
        
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            family: 4
        };

        console.log('Tentando conectar ao banco de dados...');
        await mongoose.connect(stringConexao, options);
        
        console.log('Conectado ao MongoDB Atlas com sucesso!');
        console.log(`Conectado ao banco: ${mongoose.connection.name}`);
        
        mongoose.connection.on('error', (err) => {
            console.error('Erro na conexão:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Desconectado do MongoDB');
        });

        mongoose.connection.on('connected', () => {
            console.log('Reconectado ao MongoDB');
        });

        return mongoose.connection;
    } catch (erro) {
        console.error('Erro detalhado na conexão:', erro);
        throw erro;
    }
}