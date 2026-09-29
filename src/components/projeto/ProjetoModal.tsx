import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import './ProjetoModal.css'
import { useNavigate } from "react-router-dom";

type Midia = {
  id: number;
  nome: string;
  tipo: string;
  url: string;
};

type Projeto = {
  id: number;
  titulo: string;
  descricao: string;
  createdAt: string;
  userId: number;
  user: {
    id: number;
    nome: string;
  };
  midias: Midia[];
};

type ProjetoModalProps = {
  projeto: Projeto | null;
  aberto: boolean;
  onFechar: () => void;
};

export default function ProjetoModal({
  projeto,
  aberto,
  onFechar,
}: ProjetoModalProps) {
  const navigate = useNavigate();

  if (!projeto) {
    return null;
  }

  const imagens = projeto.midias.filter((midia) =>
    midia.tipo.startsWith("image/"),
  );

  function verProjeto(projetoId: number) {
    onFechar();
    navigate(`/projetos/${projetoId}`);
  }

  return (
   <Dialog open={aberto} onOpenChange={(valor) => !valor && onFechar()}>
  <DialogContent className="projeto-modal">
    <div className="projeto-modal-conteudo">

      <DialogHeader className="projeto-modal-header">
        <DialogTitle className="projeto-modal-titulo">
          {projeto.titulo}
        </DialogTitle>

        <DialogDescription className="projeto-modal-autor">
          Criado por{" "}
          <strong>{projeto.user.nome}</strong>
        </DialogDescription>
      </DialogHeader>

      {imagens.length > 0 && (
        <div className="projeto-modal-imagens">
          {imagens.map((imagem) => (
            <img
              key={imagem.id}
              src={`http://localhost:3000${imagem.url}`}
              alt={imagem.nome}
              className="projeto-modal-imagem"
            />
          ))}
        </div>
      )}

      <div className="projeto-modal-descricao">
        <h3>Sobre o projeto</h3>

        <p>{projeto.descricao}</p>
      </div>

      <div className="projeto-modal-footer">
        <span className="projeto-modal-data">
          Projeto criado em{" "}
          {new Date(projeto.createdAt).toLocaleDateString("pt-BR")}
        </span>

        <button
          onClick={() => verProjeto(projeto.id)}
          className="projeto-modal-ver-mais"
        >
          Ver mais
        </button>
      </div>

    </div>
  </DialogContent>
</Dialog>
  );
}
