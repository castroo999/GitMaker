import { useEffect, useState, type FormEvent } from "react";
import { apiUrl } from "@/lib/api";
import "./SeusProjetos.css";
import { useNavigate } from "react-router-dom";
import { Pencil, Save, Trash2, X } from "lucide-react";
import ProjectLikeButton from "@/components/projeto/ProjectLikeButton";

type Projeto = {
  id: number;
  titulo: string;
  descricao: string;
  createdAt: string;
  userId: number;
  user: {
    id: number;
    nome: string;
  };
  midias: {
    id: number;
    nome: string;
    tipo: string;
    url: string;
  }[];
  _count?: { curtidas: number };
  curtidas?: { userId: number }[];
};

export default function SeusProjetos() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [projetoEmEdicao, setProjetoEmEdicao] = useState<number | null>(null);
  const [tituloEdicao, setTituloEdicao] = useState("");
  const [descricaoEdicao, setDescricaoEdicao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroAcao, setErroAcao] = useState("");
  const navigate = useNavigate();

  function atualizarCurtidas(
    projetoId: number,
    curtidas: number,
    curtido: boolean,
  ) {
    setProjetos((atuais) =>
      atuais
        .map((projeto) =>
          projeto.id === projetoId
            ? {
                ...projeto,
                _count: { curtidas },
                curtidoPeloUsuario: curtido,
              }
            : projeto,
        )
        .sort(
          (a, b) =>
            (b._count?.curtidas ?? 0) - (a._count?.curtidas ?? 0) ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    );
  }

  async function salvarEdicao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (projetoEmEdicao === null) return;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (!tituloEdicao.trim() || !descricaoEdicao.trim()) {
      setErroAcao("Preencha o título e a descrição do projeto.");
      return;
    }

    setSalvando(true);
    setErroAcao("");
    try {
      const resposta = await fetch(
        apiUrl(`/projetos/atualizar-projeto/${projetoEmEdicao}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            titulo: tituloEdicao.trim(),
            descricao: descricaoEdicao.trim(),
          }),
        },
      );
      const dados: unknown = await resposta.json();
      if (!resposta.ok) {
        const mensagem =
          typeof dados === "object" &&
          dados !== null &&
          "mensagem" in dados &&
          typeof dados.mensagem === "string"
            ? dados.mensagem
            : "Não foi possível salvar o projeto.";
        throw new Error(mensagem);
      }

      setProjetos((atuais) =>
        atuais.map((projeto) =>
          projeto.id === projetoEmEdicao
            ? { ...projeto, titulo: tituloEdicao.trim(), descricao: descricaoEdicao.trim() }
            : projeto,
        ),
      );
      setProjetoEmEdicao(null);
    } catch (error: unknown) {
      setErroAcao(
        error instanceof Error ? error.message : "Erro ao salvar o projeto.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProjeto(projeto: Projeto) {
    if (!window.confirm(`Excluir o projeto "${projeto.titulo}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setErroAcao("");
    setSalvando(true);
    try {
      const resposta = await fetch(
        apiUrl(`/projetos/deletar-projeto/${projeto.id}`),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const dados: unknown = await resposta.json();
      if (!resposta.ok) {
        const mensagem =
          typeof dados === "object" &&
          dados !== null &&
          "mensagem" in dados &&
          typeof dados.mensagem === "string"
            ? dados.mensagem
            : "Não foi possível excluir o projeto.";
        throw new Error(mensagem);
      }

      setProjetos((atuais) =>
        atuais.filter((item) => item.id !== projeto.id),
      );
      if (projetoEmEdicao === projeto.id) setProjetoEmEdicao(null);
    } catch (error: unknown) {
      setErroAcao(
        error instanceof Error ? error.message : "Erro ao excluir o projeto.",
      );
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    async function carregarSeusProjetos() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const resposta = await fetch(
          apiUrl("/projetos/meus-projetos"),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
          console.log(dados.mensagem);
          return;
        }

        setProjetos(dados.projetos);
        setCarregando(false);
      } catch {
        setErro("Erro ao conectar com o servidor");
        setCarregando(false);
      }
    }

    carregarSeusProjetos();
  }, [navigate]);

  return (
    <main className="seus-projetos">
      <div className="seus-projetos-conteudo">
        <div className="seus-projetos-topo">
          <div>
            <h1>Seus projetos</h1>
            <p>Gerencie os projetos que você criou.</p>
          </div>
          <button onClick={() => navigate("/criar")}>Criar projeto</button>
        </div>

        {carregando && (
          <p className="seus-projetos-status">Carregando seus projetos...</p>
        )}

        {erro && <p className="seus-projetos-erro">{erro}</p>}
        {erroAcao && <p className="seus-projetos-erro" role="alert">{erroAcao}</p>}

        {!carregando && !erro && projetos.length === 0 && (
          <div className="seus-projetos-vazio">
            <h2>Você ainda não criou nenhum projeto</h2>
            <p>Crie seu primeiro projeto para começar.</p>
            <button onClick={() => navigate("/criar")}>
              Criar primeiro projeto
            </button>
          </div>
        )}

        {!carregando && !erro && projetos.length > 0 && (
          <section className="seus-projetos-lista">
            {projetos.map((projeto) => (
              <article className="seu-projeto-card" key={projeto.id}>
                {projeto.midias.length > 0 ? (
                  <img src={projeto.midias[0].url} alt={projeto.titulo} />
                ) : (
                  <div className="seu-projeto-sem-imagem">Sem imagem</div>
                )}

                <div className="seu-projeto-info">
                  {projetoEmEdicao === projeto.id ? (
                    <form
                      className="seu-projeto-edicao"
                      onSubmit={(evento) => void salvarEdicao(evento)}
                    >
                      <label>
                        Título
                        <input
                          value={tituloEdicao}
                          onChange={(evento) => setTituloEdicao(evento.target.value)}
                          maxLength={120}
                        />
                      </label>
                      <label>
                        Descrição
                        <textarea
                          value={descricaoEdicao}
                          onChange={(evento) => setDescricaoEdicao(evento.target.value)}
                          rows={4}
                          maxLength={5000}
                        />
                      </label>
                      <div className="seu-projeto-acoes">
                        <button type="submit" disabled={salvando}>
                          <Save size={15} />
                          Salvar
                        </button>
                        <button
                          type="button"
                          className="seu-projeto-cancelar"
                          onClick={() => setProjetoEmEdicao(null)}
                          disabled={salvando}
                        >
                          <X size={15} />
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h2>{projeto.titulo}</h2>
                      <p>{projeto.descricao}</p>
                      <span>
                        {new Date(projeto.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                      <div className="seu-projeto-acoes">
                        <ProjectLikeButton
                          projetoId={projeto.id}
                          curtidasIniciais={projeto._count?.curtidas ?? 0}
                          curtidoInicialmente={(projeto.curtidas?.length ?? 0) > 0}
                          onAtualizar={atualizarCurtidas}
                        />
                        <button
                          type="button"
                          className="seu-projeto-abrir"
                          onClick={() => navigate(`/projetos/${projeto.id}`)}
                        >
                          Abrir projeto
                        </button>
                        <button
                          type="button"
                          className="seu-projeto-editar"
                          onClick={() => {
                            setProjetoEmEdicao(projeto.id);
                            setTituloEdicao(projeto.titulo);
                            setDescricaoEdicao(projeto.descricao);
                            setErroAcao("");
                          }}
                          disabled={salvando}
                        >
                          <Pencil size={15} />
                          Editar
                        </button>
                        <button
                          type="button"
                          className="seu-projeto-excluir"
                          onClick={() => void excluirProjeto(projeto)}
                          disabled={salvando}
                        >
                          <Trash2 size={15} />
                          Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
