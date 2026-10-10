import {
  ArrowRight,
  CalendarDays,
  LockKeyhole,
  UnlockKeyhole,
  UserRound,
} from "lucide-react";
import formatarDataComunidade from "./formatarDataComunidade";
import type { Comunidade } from "./tiposComunidade";

interface Props {
  comunidade: Comunidade;
  comunidadeFechada: boolean;
  ehCriador: boolean;
  statusParticipacao: string;
  bloqueadoAte: string | null;
  solicitando: boolean;
  onSolicitarEntrada: () => void;
}

export default function CabecalhoComunidade({
  comunidade,
  comunidadeFechada,
  ehCriador,
  statusParticipacao,
  bloqueadoAte,
  solicitando,
  onSolicitarEntrada,
}: Props) {
  const deveSolicitarEntrada =
    comunidadeFechada && !ehCriador && statusParticipacao !== "APROVADO";
  const deveEntrarNaComunidadeAberta =
    !comunidadeFechada && !ehCriador && statusParticipacao !== "APROVADO";
  const banido = !ehCriador && statusParticipacao === "BANIDO";
  const removido = !ehCriador && statusParticipacao === "REMOVIDO" &&
    bloqueadoAte !== null && new Date(bloqueadoAte).getTime() > Date.now();

  return (
    <section className="vc-cabecalho">
      <div className="vc-identidade">
        <div className="vc-avatar-comunidade">
          {comunidade.nome.charAt(0).toUpperCase()}
        </div>

        <div className="vc-identidade-texto">
          <div className="vc-titulo-linha">
            <h1>{comunidade.nome}</h1>
            <span
              className={
                comunidadeFechada
                  ? "vc-selo vc-selo-fechado"
                  : "vc-selo vc-selo-livre"
              }
            >
              {comunidadeFechada ? (
                <LockKeyhole size={15} />
              ) : (
                <UnlockKeyhole size={15} />
              )}
              {comunidadeFechada ? "Fechada" : "Livre"}
            </span>
          </div>

          <p>{comunidade.descricao}</p>
        </div>
      </div>

      <div className="vc-informacoes">
        <span>
          <UserRound size={16} />
          Criada por {comunidade.creator.nome}
        </span>
        <span>
          <CalendarDays size={16} />
          Criada em {formatarDataComunidade(comunidade.createdAt)}
        </span>
      </div>

      {(banido || removido) && (
        <div className="vc-aviso-privado">
          <LockKeyhole size={21} />
          <div>
            <strong>{banido ? "Você foi banido desta comunidade" : "Acesso temporariamente bloqueado"}</strong>
            <p>
              {banido
                ? "O criador baniu seu acesso permanentemente."
                : `Você poderá solicitar entrada novamente em ${new Date(bloqueadoAte!).toLocaleString("pt-BR")}.`}
            </p>
          </div>
        </div>
      )}

      {deveSolicitarEntrada && !banido && !removido && (
        <div className="vc-aviso-privado">
          <LockKeyhole size={21} />
          <div>
            <strong>Esta é uma comunidade fechada</strong>
            <p>
              Solicite sua entrada para ter acesso às publicações e aos membros
              depois da aprovação.
            </p>
          </div>

          <button
            className="vc-botao-principal"
            type="button"
            disabled={solicitando || statusParticipacao === "PENDENTE"}
            onClick={onSolicitarEntrada}
          >
            {solicitando
              ? "Enviando..."
              : statusParticipacao === "PENDENTE"
                ? "Aguardando aprovação"
                : "Solicitar entrada"}
            {!solicitando && statusParticipacao !== "PENDENTE" && (
              <ArrowRight size={16} />
            )}
          </button>
        </div>
      )}

      {deveEntrarNaComunidadeAberta && !banido && !removido && (
        <div className="vc-aviso-privado vc-aviso-comunidade-aberta">
          <UnlockKeyhole size={21} />
          <div>
            <strong>Esta comunidade é aberta</strong>
            <p>Entre para acompanhar as publicações e enviar projetos para aprovação.</p>
          </div>
          <button
            className="vc-botao-principal"
            type="button"
            disabled={solicitando}
            onClick={onSolicitarEntrada}
          >
            {solicitando ? "Entrando..." : "Entrar na comunidade"}
            {!solicitando && <ArrowRight size={16} />}
          </button>
        </div>
      )}
    </section>
  );
}
