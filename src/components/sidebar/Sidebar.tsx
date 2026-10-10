import {
  UserRound,
  Folder,
  Globe,
  ArrowRight,
  Users,
  Settings,
  Info,
  Plus,
  LogOut,
  Folders,
} from "lucide-react";
import "./Sidebar.css";
import { useNavigate } from "react-router-dom";


type SidebarProps = {
  minimizada: boolean;
  setMinimizada: React.Dispatch<React.SetStateAction<boolean>>;
  onAbrirSobre: () => void
  onAbrirConfiguracoes: () => void;
};

function obterNomeUsuario(): string {
  const usuario = localStorage.getItem("usuario");

  if (!usuario) return "Usuário";

  try {
    const dados: unknown = JSON.parse(usuario);

    if (
      typeof dados === "object" &&
      dados !== null &&
      "nome" in dados &&
      typeof dados.nome === "string" &&
      dados.nome.trim()
    ) {
      return dados.nome;
    }
  } catch (error: unknown) {
    if (!(error instanceof SyntaxError)) throw error;
  }

  return "Usuário";
}

export default function Sidebar({ minimizada, setMinimizada, onAbrirSobre, onAbrirConfiguracoes, }: SidebarProps) {
  const navigate = useNavigate();
  const nomeUsuario = obterNomeUsuario();


  function sair() {
    localStorage.clear();
    navigate("/login");
    alert("Voce saiu com susesso da sua conta!");
  }

  return (
    <section className={`sidebar-topo ${minimizada ? "minimizada" : ""}`}>
      <div className="perfil">
        <UserRound />
        {!minimizada && <h2>{nomeUsuario}</h2>}

        <button
          className="botao-toggle"
          onClick={() => setMinimizada(!minimizada)}
          aria-label={minimizada ? "Expandir sidebar" : "Minimizar sidebar"}
        >
          <ArrowRight />
        </button>
      </div>

      <div className="itens-sidebar">
        <button onClick={() => navigate("/home")}>
          <Folder />
          {!minimizada && <span>Projetos</span>}
        </button>

        <button onClick={() => navigate("/meus-projetos")}>
          <Folders />
          {!minimizada && <span>Seus projetos</span>}
        </button>

        <button onClick={() => navigate("/criar")}>
          <Plus />
          {!minimizada && <span>Criar Projetos</span>}
        </button>

        <button onClick={() => navigate('/comunidades')}>
          <Globe />
          {!minimizada && <span>Comunidades</span>}
        </button>

        <button>
          <Users />
          {!minimizada && <span>Amigos</span>}
        </button>
      </div>

      <div className="sidebar-footer">
        <button onClick={onAbrirConfiguracoes}>
          <Settings />
          {!minimizada && <span>Configurações</span>}
        </button>

        <button onClick={onAbrirSobre}>
          <Info />
          {!minimizada && <span>Sobre</span>}
        </button>

        <button onClick={sair}>
          <LogOut />
          {!minimizada && <span>Sair</span>}
        </button>
      </div>
    </section>
  );
}
