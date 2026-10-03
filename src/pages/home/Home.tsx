import { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import ProjetoModal from "@/components/projeto/ProjetoModal";

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
};

export default function Home() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(
    null,
  );

  const [modalAberto, setModalAberto] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function carregarHome() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const resposta = await fetch(
          "http://localhost:3000/projetos/listar-projetos",
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
          setErro("Não foi possível carregar os projetos");
          setCarregando(false);
          return;
        }

        setProjetos(dados.projetos);
        setCarregando(false);
      } catch (error) {
        console.log(error);
        setErro("Não foi possível carregar os projetos");
        setCarregando(false);
      }
    }

    carregarHome();
  }, [navigate]);

  function abrirProjeto(projeto: Projeto) {
    setProjetoSelecionado(projeto);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setProjetoSelecionado(null);
  }

  return (
    <div className="layout">
      

      <main className="conteudo">
        <h1>Projetos</h1>

        {carregando && <p>Carregando projetos...</p>}

        {!carregando && erro && <p>{erro}</p>}

        {!carregando && !erro && (
          <div className="cards-projetos">
            {projetos.map((projeto) => {
              const imagem = projeto.midias.find((midia) =>
                midia.tipo.startsWith("image/"),
              );

              return (
                <div key={projeto.id} onClick={() => abrirProjeto(projeto)}>
                  {imagem && (
                    <img
                      src={`http://localhost:3000${imagem.url}`}
                      alt={projeto.titulo}
                    />
                  )}

                  <h2>{projeto.titulo}</h2>

                  <p>{projeto.descricao}</p>

                  <span>Criado por {projeto.user.nome}</span>
                </div>
              );
            })}
          </div>
        )}

        <ProjetoModal
          projeto={projetoSelecionado}
          aberto={modalAberto}
          onFechar={fecharModal}
        />
      </main>
    </div>
  );
}
