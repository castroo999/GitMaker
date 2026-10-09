import "./Comunidades.css";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  ArrowRight,
  Users,
  MessageCircle,
  X,
  LockKeyhole,
  UnlockKeyhole,
  Lock,
} from "lucide-react";

interface Comunidade {
  id: number;
  nome: string;
  descricao: string;
  tipoEntrada: string;
  creator: {
    id: number;
    nome: string;
  };
  _count: {
    membros: number;
    posts: number;
  };
}

interface RespostaComunidades {
  comunidades: Comunidade[];
}

interface RespostaApi {
  mensagem?: string;
  erro?: string;
  status?: string;
}

export default function Comunidades() {
  const [comunidades, setComunidades] = useState<Comunidade[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [criando, setCriando] = useState(false);
  const [erroFormulario, setErroFormulario] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoEntrada, setTipoEntrada] = useState<"LIVRE" | "APROVACAO">(
    "LIVRE",
  );
  const [statusParticipacao, setStatusParticipacao] = useState<
    Record<number, string>
  >({});
  const [solicitando, setSolicitando] = useState<number | null>(null);
  const navigate = useNavigate();

  const carregarComunidades = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await fetch("http://localhost:3000/comunidades");

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar as comunidades.");
      }

      const dados: RespostaComunidades = await resposta.json();
      setComunidades(dados.comunidades);
    } catch (error: unknown) {
      setErro(
        error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarComunidades();
  }, [carregarComunidades]);

  async function criarComunidade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroFormulario("");
    setSucesso("");

    const nomeLimpo = nome.trim();
    const descricaoLimpa = descricao.trim();

    if (!nomeLimpo || !descricaoLimpa) {
      setErroFormulario("Preencha o nome e a descrição.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setErroFormulario(
        "Você precisa entrar na sua conta para criar uma comunidade.",
      );
      return;
    }

    try {
      setCriando(true);

      const resposta = await fetch("http://localhost:3000/comunidades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: nomeLimpo,
          descricao: descricaoLimpa,
          tipoEntrada,
        }),
      });

      const dados: RespostaApi = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem ||
            dados.erro ||
            "Não foi possível criar a comunidade.",
        );
      }

      setNome("");
      setDescricao("");
      setTipoEntrada("LIVRE");
      setModalAberto(false);
      setSucesso("Comunidade criada com sucesso!");

      await carregarComunidades();
    } catch (error: unknown) {
      setErroFormulario(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado ao criar a comunidade.",
      );
    } finally {
      setCriando(false);
    }
  }

  async function solicitarEntrada(communityId: number) {
    setErro("");
    setSucesso("");

    const token = localStorage.getItem("token");

    if (!token) {
      setErro("Entre na sua conta para solicitar entrada em uma comunidade.");
      return;
    }

    try {
      setSolicitando(communityId);

      const resposta = await fetch(
        `http://localhost:3000/comunidades/${communityId}/entrar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const dados: RespostaApi = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || dados.erro || "Não foi possível solicitar entrada.",
        );
      }

      const novoStatus = dados.status || "PENDENTE";

      setStatusParticipacao((anterior) => ({
        ...anterior,
        [communityId]: novoStatus,
      }));

      setSucesso(dados.mensagem || "Solicitação processada com sucesso.");

      if (novoStatus === "APROVADO") {
        await carregarComunidades();
      }
    } catch (error: unknown) {
      setErro(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado ao solicitar entrada.",
      );
    } finally {
      setSolicitando(null);
    }
  }

  const comunidadesFiltradas = comunidades.filter((comunidade) => {
    const termo = busca.trim().toLowerCase();

    return (
      comunidade.nome.toLowerCase().includes(termo) ||
      comunidade.descricao.toLowerCase().includes(termo)
    );
  });

  function abrirModal() {
    setErroFormulario("");
    setSucesso("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (criando) return;

    setModalAberto(false);
    setErroFormulario("");
  }

  return (
    <section className="comuni">
      <header className="comuni-header">
        <div className="comuni-header-texto">
          <h1>Comunidades</h1>
          <p>Encontre pessoas, compartilhe ideias e desenvolva projetos.</p>
        </div>

        <div className="comuni-acoes">
          <div className="comuni-busca">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar comunidades..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
            {busca && (
              <button
                type="button"
                className="comuni-limpar-busca"
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button type="button" className="comuni-criar" onClick={abrirModal}>
            <Plus size={18} />
            Criar comunidade
          </button>
        </div>
      </header>

      {sucesso && (
        <div className="comuni-sucesso" role="status">
          {sucesso}
          <button
            type="button"
            onClick={() => setSucesso("")}
            aria-label="Fechar mensagem"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {erro && (
        <div className="comuni-erro" role="alert">
          {erro}
          <button
            type="button"
            onClick={() => setErro("")}
            aria-label="Fechar mensagem"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="comuni-content">
        <div className="comuni-introducao">
          <div>
            <h2>Explore comunidades</h2>
            <p>
              Participe de grupos que combinam com seus interesses e compartilhe
              seus projetos.
            </p>
          </div>
        </div>

        <div className="em-destaque">
          <div className="comuni-lista-header">
            <div>
              <h2>Comunidades disponíveis</h2>
              <p>
                {comunidadesFiltradas.length}{" "}
                {comunidadesFiltradas.length === 1
                  ? "comunidade encontrada"
                  : "comunidades encontradas"}
              </p>
            </div>
          </div>

          {carregando ? (
            <div className="comuni-estado">
              <p>Carregando comunidades...</p>
            </div>
          ) : erro && comunidades.length === 0 ? (
            <div className="comuni-estado">
              <p>Não foi possível carregar as comunidades.</p>
              <button
                type="button"
                className="entrar"
                onClick={() => void carregarComunidades()}
              >
                Tentar novamente
              </button>
            </div>
          ) : comunidadesFiltradas.length === 0 ? (
            <div className="comuni-estado">
              <Users size={34} />
              <h3>
                {busca
                  ? "Nenhuma comunidade encontrada"
                  : "Ainda não existem comunidades"}
              </h3>
              <p>
                {busca
                  ? "Tente pesquisar usando outros termos."
                  : "Crie a primeira comunidade e convide outras pessoas."}
              </p>
              {!busca && (
                <button
                  type="button"
                  className="comuni-criar"
                  onClick={abrirModal}
                >
                  <Plus size={18} />
                  Criar comunidade
                </button>
              )}
            </div>
          ) : (
            <div className="comuni-grid">
              {comunidadesFiltradas.map((comunidade) => {
                const status = statusParticipacao[comunidade.id];
                const entradaPorAprovacao =
                  comunidade.tipoEntrada === "APROVACAO";
                const aguardandoAprovacao = status === "PENDENTE";
                const jaAprovado = status === "APROVADO";
                const enviandoSolicitacao = solicitando === comunidade.id;

                return (
                  <article key={comunidade.id} className="overlay">
                    <div className="comuni-card-titulo">
                      <h2>{comunidade.nome}</h2>

                      {entradaPorAprovacao ? (
                        <span
                          className="comuni-selo-fechada"
                          title="Entrada mediante aprovação"
                          aria-label="Comunidade fechada"
                        >
                          <LockKeyhole size={15} />
                          <span>Fechada</span>
                        </span>
                      ) : (
                        <span
                          className="comuni-selo-livre"
                          title="Entrada livre"
                        >
                          <UnlockKeyhole size={15} />
                          <span>Livre</span>
                        </span>
                      )}
                    </div>

                    <p className="comuni-descricao">{comunidade.descricao}</p>

                    <div className="comuni-estatisticas">
                      <span>
                        <Users size={16} />
                        {comunidade._count.membros}{" "}
                        {comunidade._count.membros === 1 ? "membro" : "membros"}
                      </span>

                      <span>
                        <MessageCircle size={16} />
                        {comunidade._count.posts}{" "}
                        {comunidade._count.posts === 1
                          ? "publicação"
                          : "publicações"}
                      </span>
                    </div>

                    <p className="comuni-criador">
                      Criada por: {comunidade.creator.nome}
                    </p>

                    {entradaPorAprovacao && (
                      <p className="comuni-tipo-entrada">
                        <LockKeyhole size={14} />
                        Entrada mediante aprovação
                      </p>
                    )}

                    {entradaPorAprovacao && !jaAprovado ? (
                      <button
                        className="entrar"
                        type="button"
                        disabled={enviandoSolicitacao || aguardandoAprovacao}
                        onClick={() => void solicitarEntrada(comunidade.id)}
                      >
                        {aguardandoAprovacao
                          ? "Aguardando aprovação"
                          : enviandoSolicitacao
                            ? "Enviando solicitação..."
                            : "Solicitar entrada"}

                        {aguardandoAprovacao ? (
                          <LockKeyhole size={16} />
                        ) : (
                          <ArrowRight size={16} />
                        )}
                      </button>
                    ) : (
                      <button
                        className="entrar"
                        type="button"
                        onClick={() => navigate(`/comunidades/${comunidade.id}`)}
                      >
                        Ver comunidade
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modalAberto && (
        <div
          className="comuni-modal-fundo"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              fecharModal();
            }
          }}
        >
          <div
            className="comuni-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="comuni-modal-titulo"
          >
            <div className="comuni-modal-header">
              <div>
                <h2 id="comuni-modal-titulo">Criar comunidade</h2>
                <p>Configure seu espaço para compartilhar projetos.</p>
              </div>

              <button
                type="button"
                className="comuni-modal-fechar"
                onClick={fecharModal}
                disabled={criando}
                aria-label="Fechar modal"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="comuni-formulario"
              onSubmit={(event) => void criarComunidade(event)}
            >
              <label htmlFor="comuni-nome">Nome da comunidade</label>
              <input
                id="comuni-nome"
                type="text"
                placeholder="Ex.: Desenvolvedores React"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                maxLength={80}
                required
              />

              <label htmlFor="comuni-descricao">Descrição</label>
              <textarea
                id="comuni-descricao"
                placeholder="Explique o objetivo da comunidade..."
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                rows={4}
                maxLength={500}
                required
              />

              <label htmlFor="comuni-tipo">Tipo de comunidade</label>
              <select
                id="comuni-tipo"
                value={tipoEntrada}
                onChange={(event) =>
                  setTipoEntrada(event.target.value as "LIVRE" | "APROVACAO")
                }
              >
                <option value="LIVRE">
                  Livre — qualquer pessoa pode entrar
                </option>
                <option value="APROVACAO">
                  <Lock size={18} /> Fechada — exige aprovação
                </option>
              </select>

              {tipoEntrada === "APROVACAO" && (
                <div className="comuni-aviso-fechada">
                  <LockKeyhole size={18} />
                  <p>
                    As pessoas precisarão solicitar entrada. Você poderá aprovar
                    ou recusar cada solicitação.
                  </p>
                </div>
              )}

              {erroFormulario && (
                <p className="comuni-form-erro" role="alert">
                  {erroFormulario}
                </p>
              )}

              <div className="comuni-modal-acoes">
                <button
                  type="button"
                  className="comuni-cancelar"
                  onClick={fecharModal}
                  disabled={criando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="comuni-criar"
                  disabled={criando}
                >
                  <Plus size={18} />
                  {criando ? "Criando..." : "Criar comunidade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
