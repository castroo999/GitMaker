import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { apiUrl } from "@/lib/api";

type PreferenciasNotificacao = {
  projetos: boolean;
  comunidades: boolean;
  permissoes: boolean;
};

type CategoriaPreferencia = keyof PreferenciasNotificacao;

const categorias: {
  chave: CategoriaPreferencia;
  titulo: string;
  descricao: string;
}[] = [
  {
    chave: "projetos",
    titulo: "Projetos",
    descricao: "Envios, aprovações e recusas de projetos em comunidades.",
  },
  {
    chave: "comunidades",
    titulo: "Comunidades",
    descricao: "Solicitações de entrada e decisões sobre sua participação.",
  },
  {
    chave: "permissoes",
    titulo: "Permissões para publicar",
    descricao: "Solicitações e decisões para publicar em comunidades.",
  },
];

interface Props {
  onVoltar: () => void;
}

function lerMensagemErro(dados: unknown, padrao: string): string {
  if (
    typeof dados === "object" &&
    dados !== null &&
    "mensagem" in dados &&
    typeof dados.mensagem === "string"
  ) {
    return dados.mensagem;
  }
  return padrao;
}

function validarPreferencias(dados: unknown): PreferenciasNotificacao {
  if (
    typeof dados !== "object" ||
    dados === null ||
    !("preferencias" in dados) ||
    typeof dados.preferencias !== "object" ||
    dados.preferencias === null ||
    !("projetos" in dados.preferencias) ||
    typeof dados.preferencias.projetos !== "boolean" ||
    !("comunidades" in dados.preferencias) ||
    typeof dados.preferencias.comunidades !== "boolean" ||
    !("permissoes" in dados.preferencias) ||
    typeof dados.preferencias.permissoes !== "boolean"
  ) {
    throw new Error("A resposta de preferências do servidor é inválida.");
  }
  return {
    projetos: dados.preferencias.projetos,
    comunidades: dados.preferencias.comunidades,
    permissoes: dados.preferencias.permissoes,
  };
}

export default function NotificationPreferences({ onVoltar }: Props) {
  const [preferencias, setPreferencias] =
    useState<PreferenciasNotificacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState<CategoriaPreferencia | null>(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      const token = localStorage.getItem("token");
      if (!token) {
        setErro("Faça login para editar suas preferências.");
        setCarregando(false);
        return;
      }

      try {
        const resposta = await fetch(apiUrl("/notificacoes/preferencias"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dados: unknown = await resposta.json();
        if (!resposta.ok) {
          throw new Error(
            lerMensagemErro(dados, "Não foi possível carregar as preferências."),
          );
        }
        const atuais = validarPreferencias(dados);
        if (!cancelado) {
          setPreferencias(atuais);
          setErro("");
        }
      } catch (error: unknown) {
        if (!cancelado) {
          setErro(
            error instanceof Error
              ? error.message
              : "Erro ao carregar as preferências.",
          );
        }
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    void carregar();
    return () => {
      cancelado = true;
    };
  }, []);

  async function alternarPreferencia(categoria: CategoriaPreferencia) {
    const token = localStorage.getItem("token");
    if (!token || !preferencias || salvando) {
      if (!token) setErro("Faça login para editar suas preferências.");
      return;
    }

    const novoValor = !preferencias[categoria];
    setSalvando(categoria);
    setErro("");
    setMensagem("");
    try {
      const resposta = await fetch(apiUrl("/notificacoes/preferencias"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [categoria]: novoValor }),
      });
      const dados: unknown = await resposta.json();
      if (!resposta.ok) {
        throw new Error(
          lerMensagemErro(dados, "Não foi possível salvar sua preferência."),
        );
      }
      setPreferencias(validarPreferencias(dados));
      setMensagem("Preferência salva.");
    } catch (error: unknown) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao salvar sua preferência.",
      );
    } finally {
      setSalvando(null);
    }
  }

  return (
    <div className="config-preferencias">
      <button
        type="button"
        className="config-voltar"
        onClick={onVoltar}
      >
        <ChevronLeft size={17} />
        Voltar às configurações
      </button>

      <div className="config-preferencias-intro">
        <h3>Receber notificações sobre</h3>
        <p>Suas escolhas são salvas automaticamente na sua conta.</p>
      </div>

      {erro && <p className="config-preferencias-erro" role="alert">{erro}</p>}
      {mensagem && <p className="config-preferencias-sucesso" role="status">{mensagem}</p>}
      {carregando ? (
        <p className="config-preferencias-estado">Carregando preferências...</p>
      ) : preferencias ? (
        <div className="config-preferencias-lista">
          {categorias.map((categoria) => (
            <div className="config-preferencia-item" key={categoria.chave}>
              <div className="config-preferencia-texto">
                <strong>{categoria.titulo}</strong>
                <span>{categoria.descricao}</span>
              </div>
              <button
                type="button"
                className={`config-interruptor ${preferencias[categoria.chave] ? "ativo" : ""}`}
                role="switch"
                aria-checked={preferencias[categoria.chave]}
                aria-label={`${categoria.titulo}: ${preferencias[categoria.chave] ? "ativado" : "desativado"}`}
                onClick={() => void alternarPreferencia(categoria.chave)}
                disabled={salvando !== null}
              >
                <span />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
