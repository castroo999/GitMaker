import "./VerComunidade.css";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FolderPlus, LoaderCircle, LogOut } from "lucide-react";
import { toast } from "react-toastify";
import CabecalhoComunidade from "../../components/comunidades/CabecalhoComunidade";
import ConteudoComunidade from "../../components/comunidades/ConteudoComunidade";
import GerenciarSolicitacoes from "../../components/comunidades/GerenciarSolicitacoes";
import GerenciarContribuicoes from "../../components/comunidades/GerenciarContribuicoes";
import GerenciarProjetosComunidade from "../../components/comunidades/GerenciarProjetosComunidade";
import ResumoComunidade from "../../components/comunidades/ResumoComunidade";
import type {
  AbaComunidade,
  Comunidade,
  Membro,
  Publicacao,
  ProjetoComunidade,
} from "../../components/comunidades/tiposComunidade";

function obterIdUsuarioLogado(): number | null {
  const usuario = localStorage.getItem("usuario");

  if (!usuario) return null;

  try {
    const dados: unknown = JSON.parse(usuario);

    if (
      typeof dados === "object" &&
      dados !== null &&
      "id" in dados &&
      typeof dados.id === "number" &&
      Number.isSafeInteger(dados.id)
    ) {
      return dados.id;
    }
  } catch (error: unknown) {
    if (error instanceof SyntaxError) return null;
    throw error;
  }

  return null;
}

export default function VerComunidade() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [comunidade, setComunidade] = useState<Comunidade | null>(null);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [projetos, setProjetos] = useState<ProjetoComunidade[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<AbaComunidade>("publicacoes");
  const [carregando, setCarregando] = useState(true);
  const [carregandoConteudo, setCarregandoConteudo] = useState(false);
  const [solicitando, setSolicitando] = useState(false);
  const [solicitandoContribuicao, setSolicitandoContribuicao] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [membroEmGestao, setMembroEmGestao] = useState<number | null>(null);
  const [statusParticipacao, setStatusParticipacao] = useState("");
  const [bloqueadoAte, setBloqueadoAte] = useState<string | null>(null);
  const [statusContribuicao, setStatusContribuicao] = useState("");
  const [erro, setErro] = useState("");
  const [erroConteudo, setErroConteudo] = useState("");

  const token = localStorage.getItem("token");
  const usuarioId = obterIdUsuarioLogado();
  const comunidadeFechada = comunidade?.tipoEntrada === "APROVACAO";
  const ehCriador =
    comunidade !== null &&
    usuarioId === comunidade.creator.id;
  const podeContribuir =
    ehCriador ||
    (statusParticipacao === "APROVADO" &&
      (comunidadeFechada
        ? statusContribuicao !== "RECUSADO" && statusContribuicao !== "PENDENTE"
        : statusContribuicao === "APROVADO"));
  const podeEnviarProjeto = ehCriador || statusParticipacao === "APROVADO";

  useEffect(() => {
    if (!id || !token || !comunidade || ehCriador) return;

    let cancelado = false;
    const chaveNotificacao = `comunidade-${id}-entrada-aprovada-${usuarioId}`;

    async function verificarParticipacao() {
      try {
        const resposta = await fetch(
          `http://localhost:3000/comunidades/${id}/minha-participacao`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!resposta.ok) return;

        const dados: {
          status: string | null;
          statusContribuicao: string | null;
          bloqueadoAte: string | null;
        } = await resposta.json();
        if (cancelado || !dados.status) return;

        if (
          statusParticipacao === "APROVADO" &&
          statusContribuicao !== "APROVADO" &&
          dados.statusContribuicao === "APROVADO"
        ) {
          toast.success("O criador aprovou sua permissão para contribuir!");
        }

        setStatusParticipacao(dados.status);
        setStatusContribuicao(dados.statusContribuicao || "");
        setBloqueadoAte(dados.bloqueadoAte || null);

        if (
          comunidade?.tipoEntrada === "APROVACAO" &&
          dados.status === "APROVADO" &&
          !localStorage.getItem(chaveNotificacao)
        ) {
          toast.success("Sua entrada na comunidade foi aceita!");
          localStorage.setItem(chaveNotificacao, "true");
        }
      } catch {
        // A consulta é repetida enquanto a solicitação estiver pendente.
      }
    }

    void verificarParticipacao();
    const intervalo = window.setInterval(() => {
      if (statusParticipacao === "PENDENTE" || statusParticipacao === "APROVADO") {
        void verificarParticipacao();
      }
    }, 10000);

    return () => {
      cancelado = true;
      window.clearInterval(intervalo);
    };
  }, [comunidade, ehCriador, id, statusContribuicao, statusParticipacao, token, usuarioId]);

  const carregarComunidade = useCallback(async () => {
    if (!id || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
      setErro("O endereço desta comunidade é inválido.");
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);
      setErro("");

      const resposta = await fetch("http://localhost:3000/comunidades");

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar a comunidade.");
      }

      const dados: { comunidades: Comunidade[] } = await resposta.json();
      const encontrada = dados.comunidades.find(
        (item) => item.id === Number(id),
      );

      if (!encontrada) {
        setComunidade(null);
        throw new Error("Comunidade não encontrada.");
      }

      setComunidade(encontrada);
    } catch (error: unknown) {
      setErro(
        error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      );
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    void carregarComunidade();
  }, [carregarComunidade]);

  const carregarConteudo = useCallback(async () => {
    if (!id || !token) {
      setErroConteudo("Entre na sua conta para carregar o conteúdo.");
      return;
    }

    try {
      setCarregandoConteudo(true);
      setErroConteudo("");

      if (abaAtiva === "membros") {
        const resposta = await fetch(
          `http://localhost:3000/comunidades/${id}/membros`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
          throw new Error(
            dados.mensagem || "Não foi possível carregar os membros.",
          );
        }

        setMembros(dados.membros || []);
      }

      if (abaAtiva === "publicacoes") {
        const resposta = await fetch(
          `http://localhost:3000/comunidades/${id}/posts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
          throw new Error(
            dados.mensagem || "Não foi possível carregar as publicações.",
          );
        }

        setPublicacoes(dados.publicacoes || dados.posts || []);
      }

      if (abaAtiva === "projetos") {
        const resposta = await fetch(
          `http://localhost:3000/projetos/comunidade/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
          throw new Error(
            dados.mensagem || "Não foi possível carregar os projetos da comunidade.",
          );
        }

        setProjetos(dados.projetos || []);
      }
    } catch (error: unknown) {
      setErroConteudo(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao carregar o conteúdo.",
      );
    } finally {
      setCarregandoConteudo(false);
    }
  }, [abaAtiva, id, statusParticipacao, token]);

  useEffect(() => {
    if (comunidade) {
      void carregarConteudo();
    }
  }, [comunidade, carregarConteudo]);

  async function solicitarEntrada() {
    if (!id) return;

    if (!token) {
      setErro("Entre na sua conta para solicitar entrada.");
      return;
    }

    try {
      setSolicitando(true);
      setErro("");

      const resposta = await fetch(
        `http://localhost:3000/comunidades/${id}/entrar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Não foi possível solicitar entrada.",
        );
      }

      const novoStatus = dados.status || "PENDENTE";
      setStatusParticipacao(novoStatus);
      toast.success(
        novoStatus === "APROVADO"
          ? "Você entrou na comunidade!"
          : "Solicitação enviada. Aguarde a aprovação do criador.",
      );
      if (novoStatus === "APROVADO") await carregarComunidade();
    } catch (error: unknown) {
      setErro(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao solicitar entrada.",
      );
    } finally {
      setSolicitando(false);
    }
  }

  async function solicitarPermissaoContribuicao() {
    if (!id || !token) {
      toast.error("Entre na sua conta para solicitar permissão.");
      return;
    }

    try {
      setSolicitandoContribuicao(true);
      const resposta = await fetch(
        `http://localhost:3000/comunidades/${id}/contribuicoes/solicitar`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Não foi possível solicitar permissão.");
      }

      setStatusContribuicao(dados.statusContribuicao || "PENDENTE");
      toast.success(dados.mensagem || "Solicitação enviada ao criador.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Ocorreu um erro ao solicitar permissão.");
    } finally {
      setSolicitandoContribuicao(false);
    }
  }

  async function publicar(conteudo: string, arquivos: File[]) {
    if (!id || !token) {
      toast.error("Entre na sua conta para publicar.");
      return false;
    }

    const formulario = new FormData();
    formulario.append("conteudo", conteudo);
    arquivos.forEach((arquivo) => formulario.append("arquivos", arquivo));

    try {
      setPublicando(true);
      const resposta = await fetch(
        `http://localhost:3000/comunidades/${id}/posts`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formulario,
        },
      );
      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok || !dados.publicacao) {
        throw new Error(dados.mensagem || "Não foi possível publicar.");
      }

      setPublicacoes((atuais) => [dados.publicacao, ...atuais]);
      toast.success("Publicação enviada para a comunidade!");
      return true;
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Ocorreu um erro ao publicar.",
      );
      return false;
    } finally {
      setPublicando(false);
    }
  }

  async function sairDaComunidade() {
    if (!id || !token) {
      toast.error("Entre na sua conta para sair da comunidade.");
      return;
    }
    if (!window.confirm("Tem certeza de que deseja sair desta comunidade?")) return;

    try {
      const resposta = await fetch(`http://localhost:3000/comunidades/${id}/sair`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(dados.mensagem || "Não foi possível sair da comunidade.");

      toast.success("Você saiu da comunidade.");
      navigate("/comunidades");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao sair da comunidade.");
    }
  }

  async function gerenciarMembro(membroId: number, acao: "REMOVER" | "BANIR") {
    if (!id || !token) return;
    const confirmacao = acao === "BANIR"
      ? "Banir este membro permanentemente? Ele não poderá acessar esta comunidade novamente."
      : "Remover este membro? Ele só poderá solicitar entrada novamente após 2 dias.";
    if (!window.confirm(confirmacao)) return;

    try {
      setMembroEmGestao(membroId);
      const resposta = await fetch(`http://localhost:3000/comunidades/${id}/membros/${membroId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ acao }),
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(dados.mensagem || "Não foi possível atualizar o membro.");

      setMembros((atuais) => atuais.filter((membro) => membro.id !== membroId));
      toast.success(dados.mensagem || "Membro atualizado.");
      void carregarComunidade();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar membro.");
    } finally {
      setMembroEmGestao(null);
    }
  }

  if (carregando) {
    return (
      <main className="ver-comunidade">
        <div className="vc-estado">
          <LoaderCircle className="vc-carregando-icone" size={28} />
          <p>Carregando comunidade...</p>
        </div>
      </main>
    );
  }

  if (erro && !comunidade) {
    return (
      <main className="ver-comunidade">
        <button
          className="vc-voltar"
          type="button"
          onClick={() => navigate("/comunidades")}
        >
          <ArrowLeft size={18} />
          Voltar para comunidades
        </button>
        <div className="vc-estado">
          <h2>Não foi possível abrir a comunidade</h2>
          <p>{erro}</p>
          <button
            className="vc-botao-principal"
            type="button"
            onClick={() => void carregarComunidade()}
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  if (!comunidade) return null;

  return (
    <main className="ver-comunidade">
      <button
        className="vc-voltar"
        type="button"
        onClick={() => navigate("/comunidades")}
      >
        <ArrowLeft size={18} />
        Voltar para comunidades
      </button>

      {erro && (
        <div className="vc-alerta vc-alerta-erro" role="alert">
          {erro}
        </div>
      )}

      <CabecalhoComunidade
        comunidade={comunidade}
        comunidadeFechada={comunidadeFechada}
        ehCriador={ehCriador}
        statusParticipacao={statusParticipacao}
        bloqueadoAte={bloqueadoAte}
        solicitando={solicitando}
        onSolicitarEntrada={() => void solicitarEntrada()}
      />

      <ResumoComunidade comunidade={comunidade} />

      {!ehCriador && statusParticipacao === "APROVADO" && (
        <div className="vc-acoes-comunidade vc-acoes-sair">
          <button type="button" className="vc-botao-secundario" onClick={() => void sairDaComunidade()}>
            <LogOut size={17} />
            Sair da comunidade
          </button>
        </div>
      )}

      {podeEnviarProjeto && (
        <div className="vc-acoes-comunidade">
          <button
            type="button"
            className="vc-botao-principal"
            onClick={() => navigate(`/criar?comunidadeId=${comunidade.id}`)}
          >
            <FolderPlus size={17} />
            Criar projeto da comunidade
          </button>
        </div>
      )}

      {ehCriador && comunidadeFechada && (
        <GerenciarSolicitacoes comunidadeId={Number(id)} />
      )}

      {ehCriador && (
        <GerenciarContribuicoes
          comunidadeId={Number(id)}
          comunidadeFechada={comunidadeFechada}
        />
      )}

      {ehCriador && (
        <GerenciarProjetosComunidade
          comunidadeId={Number(id)}
          onDecidiu={() => {
            if (abaAtiva === "projetos") void carregarConteudo();
          }}
        />
      )}

      {!ehCriador && statusParticipacao === "APROVADO" && !podeContribuir && (
        <div className="vc-acoes-comunidade vc-permissao-contribuicao">
          <p>
            {statusContribuicao === "PENDENTE"
              ? "Sua solicitação para enviar publicações está aguardando aprovação."
              : "Peça ao criador autorização para enviar publicações nesta comunidade."}
          </p>
          {statusContribuicao !== "PENDENTE" && (
            <button
              type="button"
              className="vc-botao-secundario"
              onClick={() => void solicitarPermissaoContribuicao()}
              disabled={solicitandoContribuicao}
            >
              {solicitandoContribuicao
                ? "Enviando solicitação..."
                : statusContribuicao === "RECUSADO"
                  ? "Solicitar novamente"
                  : "Solicitar permissão para publicar"}
            </button>
          )}
        </div>
      )}

      <ConteudoComunidade
        abaAtiva={abaAtiva}
        criadorId={comunidade.creator.id}
        comunidadeFechada={comunidadeFechada}
        ehCriador={ehCriador}
        statusParticipacao={statusParticipacao}
        carregando={carregandoConteudo}
        erro={erroConteudo}
        publicacoes={publicacoes}
        membros={membros}
        projetos={projetos}
        publicando={publicando}
        podeContribuir={podeContribuir}
        onMudarAba={setAbaAtiva}
        onTentarNovamente={() => void carregarConteudo()}
        onAbrirProjeto={(projetoId) => navigate(`/projetos/${projetoId}`)}
        onPublicar={publicar}
        membroEmGestao={membroEmGestao}
        onGerenciarMembro={(membroId, acao) => void gerenciarMembro(membroId, acao)}
      />
    </main>
  );
}
