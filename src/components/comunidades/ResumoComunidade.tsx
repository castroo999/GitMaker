import { MessageCircle, Users } from "lucide-react";
import type { Comunidade } from "./tiposComunidade";

interface Props {
  comunidade: Comunidade;
}

export default function ResumoComunidade({ comunidade }: Props) {
  return (
    <section className="vc-resumo">
      <div className="vc-resumo-item">
        <Users size={20} />
        <div>
          <strong>{comunidade._count.membros}</strong>
          <span>{comunidade._count.membros === 1 ? "Membro" : "Membros"}</span>
        </div>
      </div>

      <div className="vc-resumo-item">
        <MessageCircle size={20} />
        <div>
          <strong>{comunidade._count.posts}</strong>
          <span>
            {comunidade._count.posts === 1 ? "Publicação" : "Publicações"}
          </span>
        </div>
      </div>
    </section>
  );
}
