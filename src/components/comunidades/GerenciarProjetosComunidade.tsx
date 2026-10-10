import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, RefreshCw, X } from "lucide-react";
import "./GerenciarSolicitacoes.css";

interface ProjetoPendente {
  id: number;
  titulo: string;
  descricao: string;
  createdAt: string;
  user: { id: number; nome: string; email: string };
}

interface Props {
  comunidadeId: number;
  onDecidiu: () => void;
}

export default function GerenciarProjetosComunidade({ comunidadeId, onDecidiu }: Props) {
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState<ProjetoPendente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [decidindo, setDecidindo] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const carregarProjetos = useCallback(async () => {
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
        `http://localhost:3000/projetos/comunidade/${comunidadeId}/pendentes`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.mensagem || "Não foi possível carregar os projetos.");
      setProjetos(dados.projetos || []);
    } catch (error: unknown) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar os projetos.");
    } finally {
      setCarregando(false);
    }
  }, [comunidadeId]);

  useEffect(() => {
    void carregarProjetos();
  }, [carregarProjetos]);

  async function decidir(projetoId: number, decisao: "APROVAR" | "RECUSAR") {
    const token = localStorage.getItem("token");
    if (!token) {
      setErro("Faça login novamente.");
      return;
    }

    setDecidindo(projetoId);
    setErro("");
    setMensagem("");
    try {
      const resposta = await fetch(
        `http://localhost:3000/projetos/comunidade/${comunidadeId}/${projetoId}/aprovacao`,
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
      if (!resposta.ok) throw new Error(dados.mensagem || "Não foi possível analisar o projeto.");
      setProjetos((atuais) => atuais.filter((projeto) => projeto.id !== projetoId));
      setMensagem(decisao === "APROVAR" ? "Projeto aprovado e liberado na comunidade." : "Projeto recusado.");
      onDecidiu();
    } catch (error: unknown) {
      setErro(error instanceof Error ? error.message : "Erro ao analisar o projeto.");
    } finally {
      setDecidindo(null);
    }
  }

  return (
    <section className="gs-container">
      <div className="gs-cabecalho">
        <div>
          <h3>Projetos em análise</h3>
          <p>{projetos.length} {projetos.length === 1 ? "pendente" : "pendentes"}</p>
        </div>
        <button type="button" className="gs-atualizar" onClick={() => void carregarProjetos()} disabled={carregando} aria-label="Atualizar projetos pendentes">
          <RefreshCw size={17} />
        </button>
      </div>

      {erro && <p className="gs-erro">{erro}</p>}
      {mensagem && <p className="gs-sucesso">{mensagem}</p>}
      {carregando ? (
        <p className="gs-vazio">Carregando projetos...</p>
      ) : projetos.length === 0 ? (
        <p className="gs-vazio">Nenhum projeto aguardando aprovação.</p>
      ) : (
        <div className="gs-lista">
          {projetos.map((projeto) => (
            <article className="gs-item gs-projeto-pendente" key={projeto.id}>
              <div className="gs-dados">
                <strong>{projeto.titulo}</strong>
                <span>{projeto.descricao}</span>
                <small>Enviado por {projeto.user.nome} · {projeto.user.email}</small>
                <small>{new Date(projeto.createdAt).toLocaleDateString("pt-BR")}</small>
              </div>
              <div className="gs-acoes">
                <button type="button" className="gs-ver-projeto" onClick={() => navigate(`/projetos/${projeto.id}`)}>
                  Ver projeto
                </button>
                <button type="button" className="gs-aprovar" onClick={() => void decidir(projeto.id, "APROVAR")} disabled={decidindo !== null}>
                  <Check size={16} /> Aprovar
                </button>
                <button type="button" className="gs-recusar" onClick={() => void decidir(projeto.id, "RECUSAR")} disabled={decidindo !== null}>
                  <X size={16} /> Recusar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
