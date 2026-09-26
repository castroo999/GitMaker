import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "uploads/projetos")
    },

    filename: (_req, file, cb) => {
        const extensao = path.extname(file.originalname)
        const nomeArquivo = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;
        cb(null, nomeArquivo);
    }
})

const upload = multer({
    storage,
});

export default upload;