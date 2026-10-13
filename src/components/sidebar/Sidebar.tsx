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
  mobileAberta: boolean;
  setMobileAberta: React.Dispatch<React.SetStateAction<boolean>>;
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

export default function Sidebar({ minimizada, setMinimizada, mobileAberta, setMobileAberta, onAbrirSobre, onAbrirConfiguracoes, }: SidebarProps) {
  const navigate = useNavigate();
  const nomeUsuario = obterNomeUsuario();
  const mostrarRotulos = !minimizada || mobileAberta;

  function navegar(caminho: string) {
    setMobileAberta(false);
    navigate(caminho);
  }


  function sair() {
    localStorage.clear();
    navigate("/login");
    alert("Voce saiu com susesso da sua conta!");
  }

  return (
    <section className={`sidebar-topo ${minimizada ? "minimizada" : ""} ${mobileAberta ? "mobile-aberta" : ""}`}>
      <div className="perfil">
        <UserRound />
        {mostrarRotulos && <h2>{nomeUsuario}</h2>}

        <button
          className="botao-toggle"
          onClick={() => setMinimizada(!minimizada)}
          aria-label={minimizada ? "Expandir sidebar" : "Minimizar sidebar"}
        >
          <ArrowRight />
        </button>
      </div>

      <div className="itens-sidebar">
        <button onClick={() => navegar("/home")}>
          <Folder />
          {mostrarRotulos && <span>Projetos</span>}
        </button>

        <button onClick={() => navegar("/meus-projetos")}>
          <Folders />
          {mostrarRotulos && <span>Seus projetos</span>}
        </button>

        <button onClick={() => navegar("/criar")}>
          <Plus />
          {mostrarRotulos && <span>Criar Projetos</span>}
        </button>

        <button onClick={() => navegar('/comunidades')}>
          <Globe />
          {mostrarRotulos && <span>Comunidades</span>}
        </button>

        <button>
          <Users />
          {mostrarRotulos && <span>Amigos</span>}
        </button>
      </div>

      <div className="sidebar-footer">
        <button onClick={() => { setMobileAberta(false); onAbrirConfiguracoes(); }}>
          <Settings />
          {mostrarRotulos && <span>Configurações</span>}
        </button>

        <button onClick={() => { setMobileAberta(false); onAbrirSobre(); }}>
          <Info />
          {mostrarRotulos && <span>Sobre</span>}
        </button>

        <button onClick={sair}>
          <LogOut />
          {mostrarRotulos && <span>Sair</span>}
        </button>
      </div>
    </section>
  );
}
