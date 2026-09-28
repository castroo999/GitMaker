import { Mail, Lock, CircleUserRound } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

type LoginFormProps = {
  isLogin: boolean;

  nome: string;
  email: string;
  senha: string;

  erro: string;
  carregando: boolean;

  onNomeChange: (value: string) => void;

  onEmailChange: (value: string) => void;

  onSenhaChange: (value: string) => void;

  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;

  onTrocarModo: () => void;

  onGithub: () => void;
};

export default function LoginForm({
  isLogin,

  nome,
  email,
  senha,

  erro,
  carregando,

  onNomeChange,
  onEmailChange,
  onSenhaChange,

  onSubmit,
  onTrocarModo,
  onGithub,
}: LoginFormProps) {
  return (
    <div className="login-content">
      <h1 className="login-title">
        {isLogin ? "Entrar no GitMaker" : "Criar sua conta"}
      </h1>

      <p className="login-description">
        {isLogin
          ? "Entre para continuar seus projetos."
          : "Crie sua conta e comece a compartilhar projetos."}
      </p>

      {erro && <div className="login-error">{erro}</div>}

      <form className="login-form" onSubmit={onSubmit}>
        {!isLogin && (
          <div className="login-field">
            <label htmlFor="nome">Nome</label>

            <div className="login-input-wrapper">
              <CircleUserRound size={16} />

              <input
                id="nome"
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(event) => onNomeChange(event.target.value)}
                autoComplete="name"
              />
            </div>
          </div>
        )}

        <div className="login-field">
          <label htmlFor="email">E-mail</label>

          <div className="login-input-wrapper">
            <Mail size={16} />

            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="login-field">
          <label htmlFor="senha">Senha</label>

          <div className="login-input-wrapper">
            <Lock size={16} />
            <input
              id="senha"
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(event) => onSenhaChange(event.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>
        </div>

        <button className="login-submit" type="submit" disabled={carregando}>
          {carregando ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
        </button>
      </form>

      

      <div className="login-divider">
        <span />

        <p>ou</p>

        <span />
      </div>

      <button className="login-social" type="button" onClick={onGithub}>
        <FaGoogle size={17} />
        Continuar Google
      </button>

      <div className="login-switch">
        <span>
          {isLogin ? "Ainda não possui uma conta?" : "Já possui uma conta?"}
        </span>

        <button type="button" onClick={onTrocarModo}>
          {isLogin ? "Criar conta" : "Entrar"}
        </button>
      </div>

      <p className="login-terms">
        Ao continuar, você concorda com os termos de uso e política de
        privacidade do GitMaker.
      </p>
    </div>
  );
}
