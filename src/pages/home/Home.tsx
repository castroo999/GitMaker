import { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import ProjetoModal from "@/components/projeto/ProjetoModal";
import { apiUrl } from "@/lib/api";
import ProjectLikeButton from "@/components/projeto/ProjectLikeButton";

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
  _count?: { curtidas: number };
  curtidas?: { userId: number }[];
  curtidoPeloUsuario?: boolean;
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
          apiUrl("/projetos/listar-projetos"),
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

  function atualizarCurtidas(
    projetoId: number,
    curtidas: number,
    curtido: boolean,
  ) {
    setProjetos((atuais) =>
      atuais
        .map((projeto) =>
          projeto.id === projetoId
            ? {
                ...projeto,
                _count: { curtidas },
                curtidoPeloUsuario: curtido,
              }
            : projeto,
        )
        .sort(
          (a, b) =>
            (b._count?.curtidas ?? 0) - (a._count?.curtidas ?? 0) ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    );
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
                  {imagem && <img src={imagem.url} alt={projeto.titulo} />}

                  <h2>{projeto.titulo}</h2>

                  <p>{projeto.descricao}</p>

                  <span>Criado por {projeto.user.nome}</span>
                  <div className="projeto-card-acoes">
                    <ProjectLikeButton
                      projetoId={projeto.id}
                      curtidasIniciais={projeto._count?.curtidas ?? 0}
                      curtidoInicialmente={
                        projeto.curtidoPeloUsuario ??
                        (projeto.curtidas?.length ?? 0) > 0
                      }
                      onAtualizar={atualizarCurtidas}
                    />
                  </div>
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
