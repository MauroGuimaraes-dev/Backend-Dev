// Importa o framework Express para criar o router
import express from 'express';
// Importa o Multer para processar uploads de arquivos
import multer from 'multer';
// Importa o módulo path para manipulação de caminhos
import path from 'path';
// Importa o controller que contém a lógica de negócio
import postsController from '../controllers/postsController.js';

// Cria uma nova instância do router
const router = express.Router();

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    // Define o diretório onde os arquivos serão salvos temporariamente
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    // Define o nome temporário do arquivo
    filename: (req, file, cb) => {
        // Usa um timestamp como nome temporário para evitar conflitos
        const nomeTemp = `temp_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, nomeTemp);
    }
});

// Filtro para validar tipos de arquivo permitidos
const fileFilter = (req, file, cb) => {
    // Lista de tipos MIME aceitos para upload
    const tiposPermitidos = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    // Verifica se o tipo do arquivo está na lista de permitidos
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);  // Aceita o arquivo
    } else {
        // Rejeita o arquivo com mensagem de erro
        cb(new Error('Tipo de arquivo não suportado. Apenas imagens são permitidas.'), false);
    }
};

// Configuração completa do Multer
const upload = multer({ 
    storage: storage,      // Usa a configuração de armazenamento definida
    fileFilter: fileFilter, // Usa o filtro de arquivos definido
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite máximo de 5MB por arquivo
    }
});

// Define as rotas do módulo posts
router.get('/', postsController.buscarTodos);          // Rota para listar todos os posts
router.post('/', postsController.criar);               // Rota para criar um post manualmente
router.post('/upload', upload.single('imagem'), postsController.uploadImagem); // Rota para upload de imagem

// Exporta o router configurado
export default router;
