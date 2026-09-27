import { useEffect, useRef, useState } from "react";
import LoginForm from "./LoginForm";
import { useNavigate } from "react-router-dom";
import { iniciarLoginBackground } from "./LoginBackground";
import "./Login.css";

export default function Login() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  function voltar() {
    navigate("/");
  }

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const cleanup = iniciarLoginBackground(canvasRef.current);

    return cleanup;
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErro("");

    if (!email || !senha) {
      setErro("Preencha o e-mail e a senha.");

      return;
    }

    if (!isLogin && !nome) {
      setErro("Informe seu nome.");

      return;
    }

    try {
      setCarregando(true);

      if (isLogin) {
        const response = await fetch("http://localhost:3000/auth/login", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            senha,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.mensagem || "Não foi possível realizar o login.",
          );
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        window.location.href = "/";
      } else {
        const response = await fetch("http://localhost:3000/auth/cadastro", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            nome,
            email,
            senha,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.mensagem || "Não foi possível criar sua conta.");
        }

        setIsLogin(true);
        setNome("");
        setSenha("");
        setErro("");
        alert("Conta criada com sucesso!");
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Ocorreu um erro.");
    } finally {
      setCarregando(false);
    }
  };

  const trocarModo = () => {
    setErro("");
    setEmail("");
    setSenha("");
    setNome("");
    setIsLogin((valor) => !valor);
  };

  const handleGithub = () => {
    setErro("Login com GitHub ainda não está disponível.");
  };

  return (
    <main className="login-page">
      <button className="voltar" onClick={voltar}> Voltar</button>
      <canvas ref={canvasRef} className="login-background" />

      <div className="login-vignette" />

      <section className="login-card">
        <LoginForm
          isLogin={isLogin}
          nome={nome}
          email={email}
          senha={senha}
          erro={erro}
          carregando={carregando}
          onNomeChange={setNome}
          onEmailChange={setEmail}
          onSenhaChange={setSenha}
          onSubmit={handleSubmit}
          onTrocarModo={trocarModo}
          onGithub={handleGithub}
        />
      </section>
    </main>
  );
}
