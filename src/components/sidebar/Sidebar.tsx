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

export default function Sidebar({ minimizada, setMinimizada, onAbrirSobre, onAbrirConfiguracoes, }: SidebarProps) {
  const navigate = useNavigate();


  function sair() {
    localStorage.clear();
    navigate("/login");
    alert("Voce saiu com susesso da sua conta!");
  }

  return (
    <section className={`sidebar-topo ${minimizada ? "minimizada" : ""}`}>
      <div className="perfil">
        <UserRound />
        {!minimizada && <h2>Gustavo Castro</h2>}

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
