import "./CriarProjetos.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/sidebar/Sidebar";
// import LoginBackground from "@/pages/login/LoginBackground";
import HeroBackground from '../../components/hero/HeroBackgound'

export default function CriarProjetos() {
  const navigate = useNavigate();
  const [erro, setErro] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  async function criarProjeto() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const resposta = await fetch(
        "http://localhost:3000/projetos/criar-projeto",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            titulo,
            descricao,
          }),
        },
      );

      const dados = await resposta.json();

      if (resposta.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login");
        return;
      }

      if (!resposta.ok) {
        setErro(dados.mensagem || "Não foi possível criar o projeto");
        return;
      }
      
      setTitulo("")
      setDescricao("")
      console.log(dados);
    } catch (error) {
      console.log(error);
      setErro("Erro ao conectar com o servidor");
    }
  }

  return (
    <div className="pagina-criar-projeto">
      <Sidebar />

      <main className="criar-projeto">
        <HeroBackground />

        <div className="criar-projeto-conteudo">
          <h1>Criar projeto</h1>

          <input
            type="text"
            placeholder="Título do projeto"
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
          />

          <textarea
            placeholder="Descrição do projeto"
            value={descricao}
            onChange={(evento) => setDescricao(evento.target.value)}
          />

          {erro && <p>{erro}</p>}

          <button onClick={criarProjeto}>Criar projeto</button>
        </div>
      </main>
    </div>
  );
}
