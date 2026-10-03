import "./CriarProjetos.css";
import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import CriarEtapa from "@/components/etapas/CriarEtapa";
import HeroBackground from "../../components/hero/HeroBackgound";

export default function CriarProjetos() {
  const navigate = useNavigate();

  const [erro, setErro] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [projetoId, setProjetoId] = useState<number | null>(null);
  const [imagens, setImagens] = useState<File[]>([]);

  function selecionarImagens(evento: ChangeEvent<HTMLInputElement>) {
    if (!evento.target.files) return;

    setImagens(Array.from(evento.target.files));
  }

  async function criarProjeto() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!titulo.trim() || !descricao.trim()) {
      setErro("Preencha todos os campos");
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

      const novoProjetoId = dados.projeto.id;

      setProjetoId(novoProjetoId);
      setErro("");

      for (const imagem of imagens) {
        const formulario = new FormData();

        formulario.append("arquivo", imagem);

        const respostaMidia = await fetch(
          `http://localhost:3000/api/projetos/${novoProjetoId}/midias`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formulario,
          },
        );

        if (!respostaMidia.ok) {
          console.error("Erro ao enviar imagem:", await respostaMidia.text());
        }
      }
    } catch (error) {
      console.log(error);
      setErro("Erro ao conectar com o servidor");
    }
  }

  return (
    <div className="pagina-criar-projeto">
      

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

          <label className="botao-arquivos">
            Escolher imagens
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={selecionarImagens}
            />
          </label>

          {imagens.length > 0 && (
            <div className="preview-imagens">
              {imagens.map((imagem, indice) => (
                <div
                  key={`${imagem.name}-${indice}`}
                  className="preview-imagem"
                >
                  <img src={URL.createObjectURL(imagem)} alt={imagem.name} />

                  <span>{imagem.name}</span>
                </div>
              ))}
            </div>
          )}

          {erro && <p>{erro}</p>}

          <button onClick={criarProjeto}>Criar projeto</button>

          {projetoId && (
            <CriarEtapa projetoId={projetoId} projetoTitulo={titulo} />
          )}
        </div>
      </main>
    </div>
  );
}
