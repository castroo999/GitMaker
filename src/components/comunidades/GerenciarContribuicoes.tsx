import { useCallback, useEffect, useState } from "react";
import { Check, RefreshCw, UserRound, X } from "lucide-react";
import "./GerenciarSolicitacoes.css";

interface SolicitacaoContribuicao {
  id: number;
  createdAt: string;
  statusContribuicao: string;
  user: {
    id: number;
    nome: string;
    email: string;
  };
}

interface Props {
  comunidadeId: number;
  comunidadeFechada: boolean;
}

export default function GerenciarContribuicoes({ comunidadeId, comunidadeFechada }: Props) {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoContribuicao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [decidindo, setDecidindo] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const carregarSolicitacoes = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErro("Faça login novamente.");
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro("");
    try {
      const resposta = await fetch(
        `http://localhost:3000/comunidades/${comunidadeId}/contribuicoes`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const dados = await resposta.json();
      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Não foi possível carregar as solicitações.");
      }
      setSolicitacoes(dados.solicitacoes || []);
    } catch (error: unknown) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar solicitações.");
    } finally {
      setCarregando(false);
    }
  }, [comunidadeId]);

  useEffect(() => {
    void carregarSolicitacoes();
  }, [carregarSolicitacoes]);

  async function decidir(membroId: number, decisao: "APROVAR" | "RECUSAR" | "REVOGAR") {
    const token = localStorage.getItem("token");
    if (!token) {
      setErro("Faça login novamente.");
      return;
    }

    setDecidindo(membroId);
    setErro("");
    setMensagem("");
    try {
      const resposta = await fetch(
        `http://localhost:3000/comunidades/${comunidadeId}/contribuicoes/${membroId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ decisao }),
        },
      );
      const dados = await resposta.json();
      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Não foi possível processar a solicitação.");
      }

      setSolicitacoes((atuais) => atuais.map((item) =>
        item.id === membroId
          ? { ...item, statusContribuicao: decisao === "APROVAR" ? "APROVADO" : "RECUSADO" }
          : item,
      ));
      setMensagem(decisao === "APROVAR"
        ? "Permissão para publicar aprovada."
        : decisao === "REVOGAR"
          ? "Permissão para publicar revogada."
          : "Solicitação recusada.");
    } catch (error: unknown) {
      setErro(error instanceof Error ? error.message : "Erro ao processar solicitação.");
    } finally {
      setDecidindo(null);
    }
  }

  return (
    <section className="gs-container">
      <div className="gs-cabecalho">
        <div>
          <h3>Permissões para publicar mensagens</h3>
          <p>
            {solicitacoes.filter((item) => item.statusContribuicao === "PENDENTE").length} solicitações pendentes
          </p>
        </div>
        <button
          type="button"
          className="gs-atualizar"
          onClick={() => void carregarSolicitacoes()}
          disabled={carregando}
          aria-label="Atualizar solicitações de contribuição"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {erro && <p className="gs-erro">{erro}</p>}
      {mensagem && <p className="gs-sucesso">{mensagem}</p>}

      {carregando ? (
        <p className="gs-vazio">Carregando solicitações...</p>
      ) : solicitacoes.length === 0 ? (
        <p className="gs-vazio">Ainda não há membros para gerenciar.</p>
      ) : (
        <div className="gs-lista">
          {solicitacoes.map((solicitacao) => (
            <article className="gs-item" key={solicitacao.id}>
              <div className="gs-usuario">
                <div className="gs-avatar"><UserRound size={20} /></div>
                <div className="gs-dados">
                  <strong>{solicitacao.user.nome}</strong>
                  <span>{solicitacao.user.email}</span>
                  <small>
                    Membro desde {new Date(solicitacao.createdAt).toLocaleDateString("pt-BR")}
                  </small>
                  <small className="gs-status-permissao">
                    {solicitacao.statusContribuicao === "APROVADO" ||
                    (comunidadeFechada && solicitacao.statusContribuicao !== "RECUSADO" && solicitacao.statusContribuicao !== "PENDENTE")
                      ? "Pode enviar mensagens"
                      : solicitacao.statusContribuicao === "PENDENTE"
                        ? "Aguardando aprovação"
                        : "Sem permissão para enviar mensagens"}
                  </small>
                </div>
              </div>
              <div className="gs-acoes">
                {solicitacao.statusContribuicao === "PENDENTE" ? (
                  <>
                    <button type="button" className="gs-aprovar" onClick={() => void decidir(solicitacao.id, "APROVAR")} disabled={decidindo !== null}>
                      <Check size={16} /> Aprovar
                    </button>
                    <button type="button" className="gs-recusar" onClick={() => void decidir(solicitacao.id, "RECUSAR")} disabled={decidindo !== null}>
                      <X size={16} /> Recusar
                    </button>
                  </>
                ) : solicitacao.statusContribuicao === "APROVADO" ||
                  (comunidadeFechada && solicitacao.statusContribuicao !== "RECUSADO" && solicitacao.statusContribuicao !== "PENDENTE") ? (
                  <button type="button" className="gs-recusar" onClick={() => void decidir(solicitacao.id, "REVOGAR")} disabled={decidindo !== null}>
                    <X size={16} /> Revogar permissão
                  </button>
                ) : (
                  <button type="button" className="gs-aprovar" onClick={() => void decidir(solicitacao.id, "APROVAR")} disabled={decidindo !== null}>
                    <Check size={16} /> Permitir mensagens
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
