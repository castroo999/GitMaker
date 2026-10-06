import { createPortal } from "react-dom";
import { Info, X } from "lucide-react";
import "./Sobre.css";

type SobreProps = {
  onFechar: () => void;
};

export default function Sobre({ onFechar }: SobreProps) {
  return createPortal(
    <div className="sobre-overlay" onClick={onFechar}>
      <section className="sobre" onClick={(evento) => evento.stopPropagation()}>
        <button
          className="sobre-fechar"
          onClick={onFechar}
          aria-label="Fechar sobre"
        >
          <X size={18} />
        </button>

        <div className="sobre-title">
          <span>Sobre nós</span>
          <Info size={17} />
        </div>

        <div className="sobre-text">
          <p>
            O <strong>GitMaker</strong> é uma plataforma criada para
            compartilhar, descobrir e documentar projetos de diferentes áreas.
          </p>

          <p>
            Nossa ideia é transformar o conhecimento de quem cria em algo que
            outras pessoas possam encontrar, entender e reproduzir. Aqui, um
            projeto não é apenas o resultado final, mas também todo o processo
            por trás dele.
          </p>

          <p>
            Você pode criar projetos, adicionar etapas, imagens, vídeos e
            informações importantes para mostrar como algo foi feito. Outros
            usuários podem explorar esses projetos, participar de comunidades e
            encontrar pessoas com interesses semelhantes.
          </p>

          <p>
            O GitMaker nasceu com o objetivo de aproximar pessoas que gostam de
            criar, aprender e compartilhar conhecimento, seja na tecnologia,
            eletrônica, marcenaria, serralheria, games, arte, projetos pessoais
            ou em qualquer outra área.
          </p>

          <p className="sobre-final">
            <strong>Crie. Documente. Compartilhe.</strong>
            <br />O seu próximo projeto pode começar aqui.
          </p>
        </div>
      </section>
    </div>,
    document.body,
  );
}
