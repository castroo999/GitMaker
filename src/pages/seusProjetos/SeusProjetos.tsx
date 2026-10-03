import { useEffect, useState } from "react";
import "./SeusProjetos.css";
import { useNavigate } from "react-router-dom";

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

export default function SeusProjetos() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarSeusProjetos() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const resposta = await fetch(
          "http://localhost:3000/projetos/meus-projetos",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
          console.log(dados.mensagem);
          return;
        }

        setProjetos(dados.projetos);
        setCarregando(false);
      } catch {
        setErro("Erro ao conectar com o servidor");
        setCarregando(false);
      }
    }

    carregarSeusProjetos();
  }, [navigate]);

  return (
    <main className="seus-projetos">
      <div className="seus-projetos-conteudo">
        <div className="seus-projetos-topo">
          <div>
            <h1>Seus projetos</h1>
            <p>Gerencie os projetos que você criou.</p>
          </div>
          <button onClick={() => navigate("/criar")}>Criar projeto</button>
        </div>

        {carregando && (
          <p className="seus-projetos-status">Carregando seus projetos...</p>
        )}

        {erro && <p className="seus-projetos-erro">{erro}</p>}

        {!carregando && !erro && projetos.length === 0 && (
          <div className="seus-projetos-vazio">
            <h2>Você ainda não criou nenhum projeto</h2>
            <p>Crie seu primeiro projeto para começar.</p>
            <button onClick={() => navigate("/criar")}>
              Criar primeiro projeto
            </button>
          </div>
        )}

        {!carregando && !erro && projetos.length > 0 && (
          <section className="seus-projetos-lista">
            {projetos.map((projeto) => (
              <article
                className="seu-projeto-card"
                key={projeto.id}
                onClick={() => navigate(`/projetos/${projeto.id}`)}
              >
                {projeto.midias.length > 0 ? (
                  <img
                    src={`http://localhost:3000${projeto.midias[0].url}`}
                    alt={projeto.titulo}
                  />
                ) : (
                  <div className="seu-projeto-sem-imagem">Sem imagem</div>
                )}

                <div className="seu-projeto-info">
                  <h2>{projeto.titulo}</h2>
                  <p>{projeto.descricao}</p>
                  <span>
                    {new Date(projeto.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
