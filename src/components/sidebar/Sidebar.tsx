import "./Sidebar.css";
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
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SideBar() {
  const [minimizada, setMinimizada] = useState(false);
  const navigate = useNavigate();

  return (
    <section className={`sidebar-topo ${minimizada ? "minimizada" : ""}`}>
      <div className="perfil">
        <UserRound />

        {!minimizada && <h2>gustavo castro</h2>}

        <button
          className="botao-toggle"
          onClick={() => setMinimizada(!minimizada)}
        >
          <ArrowRight />
        </button>
      </div>

      <div className="itens-sidebar">
        <button onClick={() => navigate("/home")}>
          <Folder />
          {!minimizada && <span>Projetos</span>}
        </button>

        <button>
          <Folders />
          {!minimizada && <span>Seus projetos</span>}
        </button>

        <button onClick={() => navigate("/criar")}>
          <Plus />
          {!minimizada && <span>Criar Projetos</span>}
        </button>

        <button>
          <Globe />
          {!minimizada && <span>Comunidades</span>}
        </button>

        <button>
          <Users />
          {!minimizada && <span>Amigos</span>}
        </button>
      </div>

      <div className="sidebar-footer">
        <button>
          <Settings />
          {!minimizada && <span>Configurações</span>}
        </button>

        <button>
          <Info />
          {!minimizada && <span>Sobre</span>}
        </button>

        <button>
          <LogOut />
          {!minimizada && <span>Sair</span>}
        </button>
      </div>
    </section>
  );
}
