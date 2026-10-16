import { useState, type MouseEvent } from "react";
import { Heart } from "lucide-react";
import { toast } from "react-toastify";
import { apiUrl } from "@/lib/api";
import "./ProjectLikeButton.css";

type Props = {
  projetoId: number;
  curtidasIniciais: number;
  curtidoInicialmente: boolean;
  onAtualizar?: (projetoId: number, curtidas: number, curtido: boolean) => void;
};

export default function ProjectLikeButton({
  projetoId,
  curtidasIniciais,
  curtidoInicialmente,
  onAtualizar,
}: Props) {
  const [curtidas, setCurtidas] = useState(curtidasIniciais);
  const [curtido, setCurtido] = useState(curtidoInicialmente);
  const [salvando, setSalvando] = useState(false);

  async function alternarCurtida(evento: MouseEvent<HTMLButtonElement>) {
    evento.stopPropagation();
    if (salvando) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Entre na sua conta para curtir projetos.");
      return;
    }

    setSalvando(true);
    try {
      const resposta = await fetch(
        apiUrl(`/projetos/${projetoId}/curtida`),
        {
          method: curtido ? "DELETE" : "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const dados: unknown = await resposta.json();
      if (
        !resposta.ok ||
        typeof dados !== "object" ||
        dados === null ||
        !("curtidas" in dados) ||
        typeof dados.curtidas !== "number" ||
        !("curtido" in dados) ||
        typeof dados.curtido !== "boolean"
      ) {
        const mensagem =
          typeof dados === "object" &&
          dados !== null &&
          "mensagem" in dados &&
          typeof dados.mensagem === "string"
            ? dados.mensagem
            : "Não foi possível atualizar a curtida.";
        throw new Error(mensagem);
      }

      setCurtidas(dados.curtidas);
      setCurtido(dados.curtido);
      onAtualizar?.(projetoId, dados.curtidas, dados.curtido);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao curtir projeto.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <button
      type="button"
      className={`project-like-button ${curtido ? "curtido" : ""}`}
      onClick={(evento) => void alternarCurtida(evento)}
      disabled={salvando}
      aria-pressed={curtido}
      aria-label={
        curtido
          ? `Remover curtida. ${curtidas} corações`
          : `Curtir projeto. ${curtidas} corações`
      }
      title={curtido ? "Remover coração" : "Dar um coração"}
    >
      <Heart size={17} fill={curtido ? "currentColor" : "none"} />
      <span>{curtidas}</span>
    </button>
  );
}
