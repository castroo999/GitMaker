import { createPortal } from "react-dom";
import { User, Palette, Shield, Bell, ChevronRight, X } from "lucide-react";
import "./ConfigModal.css";

type ConfigModalProps = {
  onFechar: () => void;
};

export default function ConfigModal({ onFechar }: ConfigModalProps) {
  return createPortal(
    <div className="config-overlay" onClick={onFechar}>
      <section
        className="config-modal"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="config-header">
          <div className="config-header-texto">
            <h2>Configurações</h2>
            <p>Gerencie sua conta e personalize sua experiência no GitMaker.</p>
          </div>

          <button
            className="config-fechar"
            onClick={onFechar}
            aria-label="Fechar configurações"
          >
            <X size={18} />
          </button>
        </header>

        <div className="config-conteudo">
          <button className="config-item">
            <div className="config-item-icone">
              <User size={18} />
            </div>

            <div className="config-item-info">
              <strong>Perfil</strong>
              <span>Altere suas informações pessoais</span>
            </div>

            <ChevronRight className="config-item-seta" />
          </button>

          <button className="config-item">
            <div className="config-item-icone">
              <Palette size={18} />
            </div>

            <div className="config-item-info">
              <strong>Aparência</strong>
              <span>Personalize a aparência do GitMaker</span>
            </div>

            <ChevronRight className="config-item-seta" />
          </button>

          <button className="config-item">
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

        <footer className="config-footer">
          <span>GitMaker</span>
          <span>Suas configurações são salvas automaticamente.</span>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
