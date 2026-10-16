import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, X } from "lucide-react";
import { apiUrl } from "@/lib/api";
import "./NotificationsCenter.css";

interface Notificacao {
  id: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  link: string;
  lida: boolean;
  createdAt: string;
}

interface RespostaNotificacoes {
  notificacoes: Notificacao[];
  naoLidas: number;
}

interface NotificationsCenterProps {
  mostrarRotulos: boolean;
  onAbrir: () => void;
}

async function lerResposta(resposta: Response): Promise<RespostaNotificacoes> {
  const dados: unknown = await resposta.json();
  if (!resposta.ok) {
    const mensagem =
      typeof dados === "object" &&
      dados !== null &&
      "mensagem" in dados &&
      typeof dados.mensagem === "string"
        ? dados.mensagem
        : "Não foi possível carregar as notificações.";
    throw new Error(mensagem);
  }

  if (
    typeof dados !== "object" ||
    dados === null ||
    !("notificacoes" in dados) ||
    !Array.isArray(dados.notificacoes) ||
    !("naoLidas" in dados) ||
    typeof dados.naoLidas !== "number"
  ) {
    throw new Error("A resposta de notificações do servidor é inválida.");
  }

  const notificacoes = dados.notificacoes;
  if (
    !notificacoes.every(
      (notificacao) =>
        typeof notificacao === "object" &&
        notificacao !== null &&
        "id" in notificacao &&
        typeof notificacao.id === "number" &&
        "tipo" in notificacao &&
        typeof notificacao.tipo === "string" &&
        "titulo" in notificacao &&
        typeof notificacao.titulo === "string" &&
        "mensagem" in notificacao &&
        typeof notificacao.mensagem === "string" &&
        "link" in notificacao &&
        typeof notificacao.link === "string" &&
        "lida" in notificacao &&
        typeof notificacao.lida === "boolean" &&
        "createdAt" in notificacao &&
        typeof notificacao.createdAt === "string",
    )
  ) {
    throw new Error("A resposta de notificações do servidor é inválida.");
  }

  return {
    notificacoes: notificacoes as Notificacao[],
    naoLidas: dados.naoLidas,
  };
}

export default function NotificationsCenter({
  mostrarRotulos,
  onAbrir,
}: NotificationsCenterProps) {
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");

  const carregarNotificacoes = useCallback(async (silencioso = false) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErro("Faça login para ver suas notificações.");
      setCarregando(false);
      return;
    }

    if (!silencioso) setCarregando(true);
    try {
      const resposta = await fetch(apiUrl("/notificacoes"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dados = await lerResposta(resposta);
      setNotificacoes(dados.notificacoes);
      setNaoLidas(dados.naoLidas);
      setErro("");
    } catch (error: unknown) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar notificações.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarNotificacoes();
    const intervalo = window.setInterval(() => {
      void carregarNotificacoes(true);
    }, 30000);
    return () => window.clearInterval(intervalo);
  }, [carregarNotificacoes]);

  async function marcarTodasComoLidas() {
    const token = localStorage.getItem("token");
    if (!token) {
      setErro("Faça login para atualizar suas notificações.");
      return;
    }

    setProcessando(true);
    try {
      const resposta = await fetch(apiUrl("/notificacoes/lidas"), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resposta.ok) {
        const dados: unknown = await resposta.json();
        const mensagem =
          typeof dados === "object" &&
          dados !== null &&
          "mensagem" in dados &&
          typeof dados.mensagem === "string"
            ? dados.mensagem
            : "Não foi possível atualizar as notificações.";
        throw new Error(mensagem);
      }
      setNotificacoes((atuais) => atuais.map((item) => ({ ...item, lida: true })));
      setNaoLidas(0);
      setErro("");
    } catch (error: unknown) {
      setErro(error instanceof Error ? error.message : "Erro ao atualizar notificações.");
    } finally {
      setProcessando(false);
    }
  }

  async function abrirNotificacao(notificacao: Notificacao) {
    if (!notificacao.lida) {
      const token = localStorage.getItem("token");
      if (!token) {
        setErro("Faça login para atualizar suas notificações.");
        return;
      }

      setProcessando(true);
      try {
        const resposta = await fetch(
          apiUrl(`/notificacoes/${notificacao.id}/lida`),
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!resposta.ok) {
          const dados: unknown = await resposta.json();
          const mensagem =
            typeof dados === "object" &&
            dados !== null &&
            "mensagem" in dados &&
            typeof dados.mensagem === "string"
              ? dados.mensagem
              : "Não foi possível atualizar a notificação.";
          throw new Error(mensagem);
        }
        setNotificacoes((atuais) =>
          atuais.map((item) =>
            item.id === notificacao.id ? { ...item, lida: true } : item,
          ),
        );
        setNaoLidas((atuais) => Math.max(0, atuais - 1));
        setErro("");
      } catch (error: unknown) {
        setErro(error instanceof Error ? error.message : "Erro ao atualizar notificação.");
        setProcessando(false);
        return;
      }
      setProcessando(false);
    }

    setAberto(false);
    navigate(notificacao.link);
  }

  return (
    <>
      <button
        type="button"
        className="notificacao-botao"
        onClick={() => {
          onAbrir();
          setAberto(true);
          void carregarNotificacoes();
        }}
        aria-label={
          naoLidas > 0
            ? `Notificações, ${naoLidas} não lidas`
            : "Notificações"
        }
      >
        <Bell />
        {mostrarRotulos && <span>Notificações</span>}
        {naoLidas > 0 && (
          <span className="notificacao-contador" aria-hidden="true">
            {naoLidas > 99 ? "99+" : naoLidas}
          </span>
        )}
      </button>

      {aberto &&
        createPortal(
          <div
            className="notificacoes-overlay"
            onClick={() => setAberto(false)}
          >
            <section
              className="notificacoes-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="notificacoes-titulo"
              onClick={(evento) => evento.stopPropagation()}
            >
              <header className="notificacoes-cabecalho">
                <div>
                  <h2 id="notificacoes-titulo">Notificações</h2>
                  <p>
                    {naoLidas} {naoLidas === 1 ? "não lida" : "não lidas"}
                  </p>
                </div>
                <div className="notificacoes-acoes">
                  <button
                    type="button"
                    onClick={() => void marcarTodasComoLidas()}
                    disabled={naoLidas === 0 || processando}
                    aria-label="Marcar todas como lidas"
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAberto(false)}
                    aria-label="Fechar notificações"
                  >
                    <X size={18} />
                  </button>
                </div>
              </header>

              {erro && <p className="notificacoes-erro" role="alert">{erro}</p>}
              {carregando ? (
                <p className="notificacoes-vazio">Carregando notificações...</p>
              ) : notificacoes.length === 0 ? (
                <p className="notificacoes-vazio">Você ainda não tem notificações.</p>
              ) : (
                <div className="notificacoes-lista">
                  {notificacoes.map((notificacao) => (
                    <button
                      type="button"
                      className={`notificacao-item ${notificacao.lida ? "lida" : "nao-lida"}`}
                      key={notificacao.id}
                      onClick={() => void abrirNotificacao(notificacao)}
                      disabled={processando}
                    >
                      <span className="notificacao-indicador" aria-hidden="true" />
                      <span className="notificacao-texto">
                        <strong>{notificacao.titulo}</strong>
                        <span>{notificacao.mensagem}</span>
                        <time dateTime={notificacao.createdAt}>
                          {new Date(notificacao.createdAt).toLocaleString("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </time>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
