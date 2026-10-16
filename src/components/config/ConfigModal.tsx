import { createPortal } from "react-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Palette, Shield, Bell, ChevronRight, X } from "lucide-react";
import NotificationPreferences from "./NotificationPreferences";
import "./ConfigModal.css";

type ConfigModalProps = {
  onFechar: () => void;
};

export default function ConfigModal({ onFechar }: ConfigModalProps) {
  const navigate = useNavigate();
  const [modoClaro, setModoClaro] = useState(
    document.documentElement.dataset.theme === "light",
  );
  const [secao, setSecao] = useState<"principal" | "notificacoes">("principal");

  function alternarTema() {
    const tema = modoClaro ? "dark" : "light";
    document.documentElement.dataset.theme = tema;
    localStorage.setItem("gitmaker-theme", tema);
    setModoClaro(tema === "light");
  }

  return createPortal(
    <div className="config-overlay" onClick={onFechar}>
      <section
        className="config-modal"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="config-header">
          <div className="config-header-texto">
            <h2>{secao === "principal" ? "Configurações" : "Notificações"}</h2>
            <p>
              {secao === "principal"
                ? "Gerencie sua conta e personalize sua experiência no GitMaker."
                : "Escolha quais notificações deseja receber."}
            </p>
          </div>

          <button
            className="config-fechar"
            onClick={onFechar}
            aria-label="Fechar configurações"
          >
            <X size={18} />
          </button>
        </header>

        {secao === "principal" ? (
          <div className="config-conteudo">
            <button
              type="button"
              className="config-item"
              onClick={() => {
                onFechar();
                navigate("/perfil");
              }}
            >
              <div className="config-item-icone">
                <User size={18} />
              </div>

              <div className="config-item-info">
                <strong>Perfil</strong>
                <span>Altere suas informações pessoais</span>
              </div>

              <ChevronRight className="config-item-seta" />
            </button>

            <button
              type="button"
              className="config-item"
              onClick={alternarTema}
              aria-pressed={modoClaro}
              aria-label="Alternar modo claro"
            >
              <div className="config-item-icone">
                <Palette size={18} />
              </div>

              <div className="config-item-info">
                <strong>Aparência</strong>
                <span>
                  {modoClaro
                    ? "Modo claro ativado"
                    : "Clique para ativar o modo claro"}
                </span>
              </div>

              <ChevronRight className="config-item-seta" />
            </button>

            <button
              type="button"
              className="config-item"
              onClick={() => setSecao("notificacoes")}
            >
              <div className="config-item-icone">
                <Bell size={18} />
              </div>

              <div className="config-item-info">
                <strong>Notificações</strong>
                <span>Controle como você recebe notificações</span>
              </div>

              <ChevronRight className="config-item-seta" />
            </button>

            <button className="config-item">
              <div className="config-item-icone">
                <Shield size={18} />
              </div>

              <div className="config-item-info">
                <strong>Privacidade e segurança</strong>
                <span>Gerencie sua segurança e privacidade</span>
              </div>

              <ChevronRight className="config-item-seta" />
            </button>
          </div>
        ) : (
          <NotificationPreferences onVoltar={() => setSecao("principal")} />
        )}

        <footer className="config-footer">
          <span>GitMaker</span>
          <span>Suas configurações são salvas automaticamente.</span>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
