import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

const uploadMidiasPublicacao = multer({
  storage,
  limits: { files: 5, fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, arquivo, callback) => {
    if (arquivo.mimetype.startsWith("image/") || arquivo.mimetype.startsWith("video/")) {
      callback(null, true);
      return;
    }

    callback(new Error("Envie somente imagens ou vídeos."));
  },
});

const uploadFotoPerfil = multer({
  storage,
  limits: { files: 1, fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, arquivo, callback) => {
    if (arquivo.mimetype.startsWith("image/")) {
      callback(null, true);
      return;
    }

    callback(new Error("Envie um arquivo de imagem para a foto de perfil."));
  },
});

export function receberFotoPerfil(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction,
) {
  uploadFotoPerfil.single("fotoPerfil")(req, res, (erro: unknown) => {
    if (erro) {
      return res.status(400).json({
        mensagem: erro instanceof Error ? erro.message : "Não foi possível receber a foto de perfil.",
      });
    }

    return next();
  });
}

export function receberMidiasPublicacao(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction,
) {
  uploadMidiasPublicacao.array("arquivos", 5)(req, res, (erro: unknown) => {
    if (erro) {
      return res.status(400).json({
        mensagem: erro instanceof Error ? erro.message : "Não foi possível receber os arquivos.",
      });
    }

    return next();
  });
}

export default upload;
