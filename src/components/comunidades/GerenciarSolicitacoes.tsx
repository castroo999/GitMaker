import { useCallback, useEffect, useState } from "react";
import { Check, X, RefreshCw, UserRound } from "lucide-react";
import "./GerenciarSolicitacoes.css";
interface Solicitacao {
  id: number;
  status: string;
  createdAt: string;
  user: {
    id: number;
    nome: string;
    email: string;
  };
}

interface Props {
  comunidadeId: number;
}

export default function GerenciarSolicitacoes({ comunidadeId }: Props) {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
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
        `http://localhost:3000/comunidades/${comunidadeId}/solicitacoes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem ||
            dados.erro ||
            "Não foi possível carregar as solicitações.",
        );
      }

      setSolicitacoes(dados.solicitacoes ?? []);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar solicitações.",
      );
    } finally {
      setCarregando(false);
    }
  }, [comunidadeId]);

  useEffect(() => {
    carregarSolicitacoes();
  }, [carregarSolicitacoes]);

  async function decidir(id: number, decisao: "APROVAR" | "RECUSAR") {
    const token = localStorage.getItem("token");

    if (!token) {
      setErro("Faça login novamente.");
      return;
    }

    setDecidindo(id);
    setErro("");
    setMensagem("");

    try {
      const resposta = await fetch(
        `http://localhost:3000/comunidades/${comunidadeId}/solicitacoes/${id}`,
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
        throw new Error(
          dados.mensagem ||
            dados.erro ||
            "Não foi possível processar a solicitação.",
        );
      }

      setSolicitacoes((atuais) =>
        atuais.filter((solicitacao) => solicitacao.id !== id),
      );

      setMensagem(
        decisao === "APROVAR"
          ? "Solicitação aprovada!"
          : "Solicitação recusada.",
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao processar solicitação.",
      );
    } finally {
      setDecidindo(null);
    }
  }

  return (
    <section className="gs-container">
      <div className="gs-cabecalho">
        <div>
          <h3>Solicitações de entrada</h3>
          <p>
            {solicitacoes.length}{" "}
            {solicitacoes.length === 1 ? "pendente" : "pendentes"}
          </p>
        </div>

        <button
          type="button"
          className="gs-atualizar"
          onClick={carregarSolicitacoes}
          disabled={carregando}
          aria-label="Atualizar solicitações"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {erro && <p className="gs-erro">{erro}</p>}
      {mensagem && <p className="gs-sucesso">{mensagem}</p>}

      {carregando ? (
        <p className="gs-vazio">Carregando solicitações...</p>
      ) : solicitacoes.length === 0 ? (
        <p className="gs-vazio">Nenhuma solicitação pendente.</p>
      ) : (
        <div className="gs-lista">
          {solicitacoes.map((solicitacao) => (
            <article className="gs-item" key={solicitacao.id}>
              <div className="gs-usuario">
                <div className="gs-avatar">
                  <UserRound size={20} />
                </div>

                <div className="gs-dados">
                  <strong>{solicitacao.user.nome}</strong>
                  <span>{solicitacao.user.email}</span>
                  <small>
                    {new Date(solicitacao.createdAt).toLocaleDateString(
                      "pt-BR",
                    )}
                  </small>
                </div>
              </div>

              <div className="gs-acoes">
                <button
                  type="button"
                  className="gs-aprovar"
                  onClick={() => decidir(solicitacao.id, "APROVAR")}
                  disabled={decidindo !== null}
                >
                  <Check size={16} />
                  Aprovar
                </button>

                <button
                  type="button"
                  className="gs-recusar"
                  onClick={() => decidir(solicitacao.id, "RECUSAR")}
                  disabled={decidindo !== null}
                >
                  <X size={16} />
                  Recusar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
