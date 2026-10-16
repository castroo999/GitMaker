import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, ImagePlus, Save, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProjectLikeButton from "@/components/projeto/ProjectLikeButton";
import { apiUrl } from "@/lib/api";
import "./Perfil.css";

type Projeto = {
  id: number;
  titulo: string;
  descricao: string;
  createdAt: string;
  midias: { id: number; nome: string; tipo: string; url: string }[];
  _count: { curtidas: number };
  curtidas: { userId: number }[];
};

type Usuario = {
  id: number;
  nome: string;
  email: string;
  descricao: string | null;
  fotoPerfil: string | null;
};

const LIMITE_FOTO_BYTES = 5 * 1024 * 1024;

function isUsuario(value: unknown): value is Usuario {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "number" &&
    "nome" in value &&
    typeof value.nome === "string" &&
    "email" in value &&
    typeof value.email === "string" &&
    "descricao" in value &&
    (typeof value.descricao === "string" || value.descricao === null) &&
    "fotoPerfil" in value &&
    (typeof value.fotoPerfil === "string" || value.fotoPerfil === null)
  );
}

function isProjeto(value: unknown): value is Projeto {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "number" &&
    "titulo" in value &&
    typeof value.titulo === "string" &&
    "descricao" in value &&
    typeof value.descricao === "string" &&
    "createdAt" in value &&
    typeof value.createdAt === "string" &&
    "midias" in value &&
    Array.isArray(value.midias) &&
    value.midias.every(
      (midia) =>
        typeof midia === "object" &&
        midia !== null &&
        "id" in midia &&
        typeof midia.id === "number" &&
        "nome" in midia &&
        typeof midia.nome === "string" &&
        "tipo" in midia &&
        typeof midia.tipo === "string" &&
        "url" in midia &&
        typeof midia.url === "string",
    ) &&
    "_count" in value &&
    typeof value._count === "object" &&
    value._count !== null &&
    "curtidas" in value._count &&
    typeof value._count.curtidas === "number" &&
    "curtidas" in value &&
    Array.isArray(value.curtidas) &&
    value.curtidas.every(
      (curtida) =>
        typeof curtida === "object" &&
        curtida !== null &&
        "userId" in curtida &&
        typeof curtida.userId === "number",
    )
  );
}

export default function Perfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [descricao, setDescricao] = useState("");
  const [fotoSelecionada, setFotoSelecionada] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    if (!fotoSelecionada) {
      setPreviewFoto(null);
      return;
    }
    const url = URL.createObjectURL(fotoSelecionada);
    setPreviewFoto(url);
    return () => URL.revokeObjectURL(url);
  }, [fotoSelecionada]);

  useEffect(() => {
    async function carregarPerfil() {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const resposta = await fetch(apiUrl("/auth/perfil"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dados: unknown = await resposta.json();
        if (!resposta.ok) {
          throw new Error(
            typeof dados === "object" &&
              dados !== null &&
              "mensagem" in dados &&
              typeof dados.mensagem === "string"
              ? dados.mensagem
              : "Não foi possível carregar o perfil.",
          );
        }

        if (
          typeof dados !== "object" ||
          dados === null ||
          !("usuario" in dados) ||
          !isUsuario(dados.usuario) ||
          !("projetos" in dados) ||
          !Array.isArray(dados.projetos) ||
          !dados.projetos.every(isProjeto)
        ) {
          throw new Error("O servidor retornou dados de perfil inválidos.");
        }

        const perfil = dados.usuario;
        setUsuario(perfil);
        setDescricao(perfil.descricao ?? "");
        setProjetos(dados.projetos);
      } catch (error: unknown) {
        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao carregar seu perfil.",
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregarPerfil();
  }, [navigate]);

  function selecionarFoto(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    evento.target.value = "";

    if (!arquivo.type.startsWith("image/")) {
      setFotoSelecionada(null);
      setErro("Escolha um arquivo de imagem.");
      return;
    }
    if (arquivo.size > LIMITE_FOTO_BYTES) {
      setFotoSelecionada(null);
      setErro("A foto deve ter no máximo 5 MB.");
      return;
    }

    setErro("");
    setSucesso("");
    setFotoSelecionada(arquivo);
  }

  async function salvarPerfil(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !usuario) {
      navigate("/login");
      return;
    }

    setSalvando(true);
    setErro("");
    setSucesso("");
    try {
      const formulario = new FormData();
      formulario.append("descricao", descricao);
      if (fotoSelecionada) formulario.append("fotoPerfil", fotoSelecionada);

      const resposta = await fetch(apiUrl("/auth/perfil"), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formulario,
      });
      const dados: unknown = await resposta.json();
      if (!resposta.ok) {
        const mensagem =
          typeof dados === "object" &&
          dados !== null &&
          "mensagem" in dados &&
          typeof dados.mensagem === "string"
            ? dados.mensagem
            : "Não foi possível salvar seu perfil.";
        throw new Error(mensagem);
      }
      if (
        typeof dados !== "object" ||
        dados === null ||
        !("usuario" in dados) ||
        !isUsuario(dados.usuario)
      ) {
        throw new Error("O servidor retornou dados de perfil inválidos.");
      }

      const perfilAtualizado = dados.usuario;
      setUsuario(perfilAtualizado);
      setDescricao(perfilAtualizado.descricao ?? "");
      setFotoSelecionada(null);
      setSucesso("Seu perfil foi atualizado.");

      try {
        const usuarioSalvo = localStorage.getItem("usuario");
        const dadosSalvos: unknown = usuarioSalvo
          ? JSON.parse(usuarioSalvo)
          : {};
        localStorage.setItem(
          "usuario",
          JSON.stringify({
            ...(typeof dadosSalvos === "object" &&
            dadosSalvos !== null &&
            !Array.isArray(dadosSalvos)
              ? dadosSalvos
              : {}),
            nome: perfilAtualizado.nome,
            fotoPerfil: perfilAtualizado.fotoPerfil,
          }),
        );
      } catch (error: unknown) {
        if (!(error instanceof SyntaxError)) throw error;
      }
      window.dispatchEvent(new Event("gitmaker:profile-updated"));
    } catch (error: unknown) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao salvar seu perfil.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function atualizarCurtidas(
    projetoId: number,
    curtidas: number,
    _curtido: boolean,
  ) {
    setProjetos((atuais) =>
      atuais
        .map((projeto) =>
          projeto.id === projetoId
            ? { ...projeto, _count: { curtidas } }
            : projeto,
        )
        .sort(
          (a, b) =>
            b._count.curtidas - a._count.curtidas ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    );
  }

  return (
    <div className="perfil-pagina">
      <header className="perfil-pagina-cabecalho">
        <div>
          
          <h1>Meu perfil</h1>
          <p>Conte um pouco sobre você e destaque seus projetos.</p>
        </div>
      </header>

      {carregando && <p className="perfil-pagina-status">Carregando perfil...</p>}
      {erro && <p className="perfil-pagina-mensagem erro" role="alert">{erro}</p>}
      {sucesso && <p className="perfil-pagina-mensagem sucesso" role="status">{sucesso}</p>}

      {!carregando && usuario && (
        <>
          <form className="perfil-editor" onSubmit={(evento) => void salvarPerfil(evento)}>
            <div className="perfil-editor-identidade">
              <div className="perfil-foto-wrapper">
                {previewFoto || usuario.fotoPerfil ? (
                  <img className="perfil-foto" src={previewFoto ?? usuario.fotoPerfil ?? ""} alt={`Foto de ${usuario.nome}`} />
                ) : (
                  <div className="perfil-foto perfil-foto-placeholder">
                    <UserRound size={40} />
                  </div>
                )}
                <label className="perfil-foto-editar" htmlFor="perfil-foto-input" title="Alterar foto de perfil">
                  <Camera size={17} />
                  <span className="sr-only">Alterar foto de perfil</span>
                </label>
                <input
                  id="perfil-foto-input"
                  type="file"
                  accept="image/*"
                  onChange={selecionarFoto}
                />
              </div>
              <div className="perfil-editor-nome">
                <h2>{usuario.nome}</h2>
                <span>{usuario.email}</span>
                <label className="perfil-escolher-foto" htmlFor="perfil-foto-input">
                  <ImagePlus size={16} />
                  Alterar foto
                </label>
              </div>
            </div>

            <label className="perfil-descricao-label" htmlFor="perfil-descricao">
              Sobre mim
              <span>Uma breve apresentação para quem visita seu perfil.</span>
            </label>
            <textarea
              id="perfil-descricao"
              value={descricao}
              onChange={(evento) => setDescricao(evento.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Escreva um pouco sobre você, seus interesses e o que gosta de criar..."
            />
            <div className="perfil-editor-rodape">
              <span>{descricao.length}/500 caracteres · Imagens de até 5 MB</span>
              <button type="submit" disabled={salvando}>
                <Save size={17} />
                {salvando ? "Salvando..." : "Salvar perfil"}
              </button>
            </div>
          </form>

          <section className="perfil-projetos">
            <div className="perfil-projetos-cabecalho">
              <div>
                <span className="perfil-pagina-etiqueta">PORTFÓLIO</span>
                <h2>Meus projetos</h2>
                <p>Os projetos com mais corações aparecem primeiro.</p>
              </div>
              <span className="perfil-projetos-total">{projetos.length} {projetos.length === 1 ? "projeto" : "projetos"}</span>
            </div>

            {projetos.length === 0 ? (
              <div className="perfil-projetos-vazio">
                <p>Você ainda não publicou nenhum projeto.</p>
                <button type="button" onClick={() => navigate("/criar")}>Criar projeto</button>
              </div>
            ) : (
              <div className="perfil-projetos-lista">
                {projetos.map((projeto) => {
                  const imagem = projeto.midias.find((midia) => midia.tipo.startsWith("image/"));
                  return (
                    <article className="perfil-projeto-card" key={projeto.id}>
                      {imagem ? (
                        <img src={imagem.url} alt="" />
                      ) : (
                        <div className="perfil-projeto-sem-imagem"><ImagePlus size={28} /></div>
                      )}
                      <div className="perfil-projeto-conteudo">
                        <h3>{projeto.titulo}</h3>
                        <p>{projeto.descricao}</p>
                        <div className="perfil-projeto-acoes">
                          <ProjectLikeButton
                            projetoId={projeto.id}
                            curtidasIniciais={projeto._count.curtidas}
                            curtidoInicialmente={projeto.curtidas.length > 0}
                            onAtualizar={atualizarCurtidas}
                          />
                          <button type="button" onClick={() => navigate(`/projetos/${projeto.id}`)}>
                            Ver projeto
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
