import { useState, type FormEvent } from "react";
import {
  ImagePlus,
  LoaderCircle,
  LockKeyhole,
  MessageCircle,
  FolderKanban,
  Users,
  Send,
  X,
  UserMinus,
  Ban,
} from "lucide-react";
import formatarDataComunidade from "./formatarDataComunidade";
import type {
  AbaComunidade,
  Membro,
  Publicacao,
  ProjetoComunidade,
} from "./tiposComunidade";

interface Props {
  abaAtiva: AbaComunidade;
  criadorId: number;
  comunidadeFechada: boolean;
  ehCriador: boolean;
  statusParticipacao: string;
  carregando: boolean;
  erro: string;
  publicacoes: Publicacao[];
  membros: Membro[];
  projetos: ProjetoComunidade[];
  publicando: boolean;
  podeContribuir: boolean;
  onMudarAba: (aba: AbaComunidade) => void;
  onTentarNovamente: () => void;
  onAbrirProjeto: (projetoId: number) => void;
  onPublicar: (conteudo: string, arquivos: File[]) => Promise<boolean>;
  membroEmGestao: number | null;
  onGerenciarMembro: (membroId: number, acao: "REMOVER" | "BANIR") => void;
}

export default function ConteudoComunidade({
  abaAtiva,
  criadorId,
  comunidadeFechada,
  ehCriador,
  statusParticipacao,
  carregando,
  erro,
  publicacoes,
  membros,
  projetos,
  publicando,
  podeContribuir,
  onMudarAba,
  onTentarNovamente,
  onAbrirProjeto,
  onPublicar,
  membroEmGestao,
  onGerenciarMembro,
}: Props) {
  const [textoPublicacao, setTextoPublicacao] = useState("");
  const [arquivosPublicacao, setArquivosPublicacao] = useState<File[]>([]);
  const conteudoRestrito = !ehCriador && statusParticipacao !== "APROVADO";
  const podePublicar = podeContribuir;

  async function enviarPublicacao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const publicada = await onPublicar(textoPublicacao, arquivosPublicacao);
    if (publicada) {
      setTextoPublicacao("");
      setArquivosPublicacao([]);
    }
  }

  return (
    <section className="vc-conteudo">
      <nav className="vc-abas" aria-label="Conteúdo da comunidade">
        <button
          type="button"
          className={
            abaAtiva === "publicacoes" ? "vc-aba vc-aba-ativa" : "vc-aba"
          }
          onClick={() => onMudarAba("publicacoes")}
        >
          <MessageCircle size={17} />
          Publicações
        </button>

        <button
          type="button"
          className={abaAtiva === "membros" ? "vc-aba vc-aba-ativa" : "vc-aba"}
          onClick={() => onMudarAba("membros")}
        >
          <Users size={17} />
          Membros
        </button>

        <button
          type="button"
          className={abaAtiva === "projetos" ? "vc-aba vc-aba-ativa" : "vc-aba"}
          onClick={() => onMudarAba("projetos")}
        >
          <FolderKanban size={17} />
          Projetos
        </button>
      </nav>

      {conteudoRestrito ? (
        <div className="vc-estado vc-estado-privado">
          <LockKeyhole size={32} />
          <h2>{comunidadeFechada ? "Conteúdo restrito" : "Entre para ver o conteúdo"}</h2>
          <p>
            {comunidadeFechada
              ? "As publicações, os projetos e a lista de membros ficam disponíveis para participantes aprovados."
              : "Entre na comunidade para acompanhar as publicações, ver os membros e enviar projetos para aprovação."}
          </p>
        </div>
      ) : carregando ? (
        <div className="vc-estado">
          <LoaderCircle className="vc-carregando-icone" size={26} />
          <p>Carregando conteúdo...</p>
        </div>
      ) : erro ? (
        <div className="vc-estado">
          <h2>Não foi possível carregar esta seção</h2>
          <p>{erro}</p>
          <button
            type="button"
            className="vc-botao-secundario"
            onClick={onTentarNovamente}
          >
            Tentar novamente
          </button>
        </div>
      ) : abaAtiva === "publicacoes" ? (
        <div className="vc-publicacoes">
          {podePublicar && (
            <form className="vc-form-publicacao" onSubmit={enviarPublicacao}>
              <textarea
                value={textoPublicacao}
                onChange={(evento) => setTextoPublicacao(evento.target.value)}
                placeholder="Compartilhe algo com a comunidade..."
                maxLength={5000}
                rows={3}
                aria-label="Mensagem da publicação"
              />
              {arquivosPublicacao.length > 0 && (
                <div className="vc-arquivos-selecionados">
                  {arquivosPublicacao.map((arquivo, indice) => (
                    <span key={`${arquivo.name}-${indice}`}>
                      {arquivo.name}
                      <button
                        type="button"
                        aria-label={`Remover ${arquivo.name}`}
                        onClick={() => setArquivosPublicacao((atuais) => atuais.filter((_, i) => i !== indice))}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="vc-form-publicacao-acoes">
                <label className="vc-anexar-arquivo">
                  <ImagePlus size={17} />
                  Foto ou vídeo
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(evento) => {
                      const selecionados = Array.from(evento.target.files || []);
                      setArquivosPublicacao((atuais) => [...atuais, ...selecionados].slice(0, 5));
                      evento.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="submit"
                  className="vc-botao-principal"
                  disabled={publicando || (!textoPublicacao.trim() && arquivosPublicacao.length === 0)}
                >
                  <Send size={16} />
                  {publicando ? "Publicando..." : "Publicar"}
                </button>
              </div>
              <small>Até 5 imagens ou vídeos, com no máximo 25 MB cada.</small>
            </form>
          )}
          {publicacoes.length > 0 ? publicacoes.map((publicacao) => {
              const nomeAutor =
                publicacao.author?.nome || publicacao.user?.nome || "Membro";
              const nomeAvatar =
                publicacao.author?.nome || publicacao.user?.nome || "?";

              return (
                <article className="vc-publicacao" key={publicacao.id}>
                  <div className="vc-publicacao-topo">
                    <div className="vc-avatar-usuario">
                      {nomeAvatar.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{nomeAutor}</strong>
                      <span>{formatarDataComunidade(publicacao.createdAt)}</span>
                    </div>
                  </div>

                  {publicacao.titulo !== "Publicação" && <h3>{publicacao.titulo}</h3>}
                  {publicacao.conteudo && <p>{publicacao.conteudo}</p>}
                  {!!publicacao.midias?.length && (
                    <div className="vc-publicacao-midias">
                      {publicacao.midias.map((midia) => midia.tipo.startsWith("video/") ? (
                        <video key={midia.id} controls preload="metadata" src={midia.url}>
                          Seu navegador não conseguiu carregar este vídeo.
                        </video>
                      ) : (
                        <img key={midia.id} src={midia.url} alt={midia.nome} loading="lazy" />
                      ))}
                    </div>
                  )}
                </article>
              );
            }) : (
          <div className="vc-estado">
            <MessageCircle size={32} />
            <h2>Nenhuma publicação ainda</h2>
            <p>
              Quando os membros compartilharem conteúdo, ele aparecerá nesta
              seção.
            </p>
          </div>
          )}
        </div>
      ) : abaAtiva === "membros" ? membros.length > 0 ? (
        <div className="vc-membros">
          {membros.map((membro) => (
            <article className="vc-membro" key={membro.id}>
              <div className="vc-avatar-usuario">
                {membro.user.nome.charAt(0).toUpperCase()}
              </div>
              <div className="vc-membro-info">
                <strong>{membro.user.nome}</strong>
                {membro.user.id === criadorId && (
                  <span>Criador da comunidade</span>
                )}
              </div>
              {ehCriador && membro.user.id !== criadorId && (
                <div className="vc-membro-acoes">
                  <button
                    type="button"
                    className="vc-membro-remover"
                    disabled={membroEmGestao !== null}
                    onClick={() => onGerenciarMembro(membro.id, "REMOVER")}
                  >
                    <UserMinus size={15} />
                    {membroEmGestao === membro.id ? "Processando..." : "Remover (2 dias)"}
                  </button>
                  <button
                    type="button"
                    className="vc-membro-banir"
                    disabled={membroEmGestao !== null}
                    onClick={() => onGerenciarMembro(membro.id, "BANIR")}
                  >
                    <Ban size={15} />
                    Banir
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="vc-estado">
          <Users size={32} />
          <h2>Nenhum membro encontrado</h2>
          <p>Os membros aprovados aparecerão aqui.</p>
        </div>
      ) : projetos.length > 0 ? (
        <div className="vc-projetos-comunidade">
          {projetos.map((projeto) => (
            <article className="vc-projeto-comunidade" key={projeto.id}>
              <div>
                <h3>{projeto.titulo}</h3>
                <p>{projeto.descricao}</p>
                <span>Criado por {projeto.user.nome}</span>
                {projeto.statusAprovacao === "PENDENTE" && (
                  <span className="vc-status-projeto vc-status-projeto-pendente">
                    Em fase de verificação
                  </span>
                )}
                {projeto.statusAprovacao === "RECUSADO" && (
                  <span className="vc-status-projeto vc-status-projeto-recusado">
                    Não aprovado
                  </span>
                )}
              </div>
              <button
                type="button"
                className="vc-botao-secundario"
                onClick={() => onAbrirProjeto(projeto.id)}
              >
                Abrir projeto
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="vc-estado">
          <FolderKanban size={32} />
          <h2>Nenhum projeto nesta comunidade</h2>
          <p>Crie um projeto para compartilhar com os membros aprovados.</p>
        </div>
      )}
    </section>
  );
}
