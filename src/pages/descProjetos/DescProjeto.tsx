import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "@/components/sidebar/Sidebar";
import "./DescProjeto.css";

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
};

type Etapa = {
  id: number;
  titulo: string;
  conteudo: string;
  ordem: number;
  createdAt: string;
};

type Midia = {
  id: number;
  nome: string;
  tipo: string;
  url: string;
  createdAt: string;
  projectId: number;
  stepId: number | null;
};

export default function DescProjeto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [midias, setMidias] = useState<Midia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarProjeto() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      if (!id) {
        setErro("Projeto não encontrado");
        setCarregando(false);
        return;
      }

      try {
        const resposta = await fetch(
          `http://localhost:3000/projetos/buscar-projeto/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
          setErro(dados.mensagem || "Não foi possível carregar o projeto");
          setCarregando(false);
          return;
        }

        setProjeto(dados);

        const respostaEtapas = await fetch(
          `http://localhost:3000/api/projetos/${id}/etapas`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const dadosEtapas = await respostaEtapas.json();

        if (respostaEtapas.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          navigate("/login");
          return;
        }

        if (!respostaEtapas.ok) {
          setErro(
            dadosEtapas.mensagem || "Não foi possível carregar as etapas",
          );
          setCarregando(false);
          return;
        }

        setEtapas(dadosEtapas.etapas);

        const respostaMidias = await fetch(
          `http://localhost:3000/api/projetos/${id}/midias`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const dadosMidias = await respostaMidias.json();

        console.log("MÍDIAS DO PROJETO:", dadosMidias.midiaListadas);

        if (respostaMidias.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          navigate("/login");
          return;
        }

        if (!respostaMidias.ok) {
          setErro(
            dadosMidias.mensagem || "Não foi possível carregar as mídias",
          );
          setCarregando(false);
          return;
        }

        setMidias(dadosMidias.midiaListadas);
        setCarregando(false);
      } catch (error) {
        console.log(error);
        setErro("Não foi possível conectar com o servidor");
        setCarregando(false);
      }
    }

    carregarProjeto();
  }, [id, navigate]);

  if (carregando) {
    return (
      <div className="layout">
        <Sidebar />

        <main className="pagina-projeto">
          <p>Carregando projeto...</p>
        </main>
      </div>
    );
  }

  if (erro || !projeto) {
    return (
      <div className="layout">
        <Sidebar />

        <main className="pagina-projeto">
          <p>{erro || "Projeto não encontrado"}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar />

      <main className="pagina-projeto">
        <button className="botao-voltar" onClick={() => navigate("/home")}>
          ← Voltar
        </button>

        <section className="projeto-header">
          <h1>{projeto.titulo}</h1>

          <p className="projeto-autor">Criado por {projeto.user.nome}</p>
        </section>

        <section className="projeto-descricao">
          <h2>Sobre o projeto</h2>

          <p>{projeto.descricao}</p>
        </section>

        {midias.length > 0 && (
          <section className="projeto-midias">
            <h2>Mídias do projeto</h2>

            <div className="lista-midias">
              {midias.map((midia) => (
                <div className="midia" key={midia.id}>
                  {midia.tipo.startsWith("image/") && (
                    <img
                      src={`http://localhost:3000${midia.url}`}
                      alt={midia.nome}
                    />
                  )}

                  {midia.tipo.startsWith("video/") && (
                    <video src={`http://localhost:3000${midia.url}`} controls />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="projeto-etapas">
          <h2>Etapas do projeto</h2>

          {etapas.map((etapa) => {
            const midiasDaEtapa = midias.filter(
              (midia) => midia.stepId === etapa.id,
            );

            return (
              <article className="etapa" key={etapa.id}>
                <div className="etapa-numero">{etapa.ordem}</div>

                <div className="etapa-conteudo">
                  <h3>{etapa.titulo}</h3>

                  <p>{etapa.conteudo}</p>

                  {midiasDaEtapa.length > 0 && (
                    <div className="etapa-midias">
                      {midiasDaEtapa.map((midia) => (
                        <div className="etapa-midia" key={midia.id}>
                          {midia.tipo.startsWith("image/") && (
                            <img
                              src={`http://localhost:3000${midia.url}`}
                              alt={midia.nome}
                            />
                          )}

                          {midia.tipo.startsWith("video/") && (
                            <video
                              src={`http://localhost:3000${midia.url}`}
                              controls
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
