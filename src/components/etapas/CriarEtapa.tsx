import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./CriarEtapa.css";

type CriarEtapaProps = {
  projetoId: number;
  projetoTitulo: string;
};

export default function CriarEtapa({
  projetoId,
  projetoTitulo,
}: CriarEtapaProps) {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [ordem, setOrdem] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  function selecionarArquivos(evento: ChangeEvent<HTMLInputElement>) {
    if (!evento.target.files) return;

    setArquivos(Array.from(evento.target.files));
  }

  async function criarEtapas() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!titulo.trim() || !conteudo.trim() || !ordem) {
      setErro("Preencha todos os campos");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(
        `http://localhost:3000/api/projetos/${projetoId}/etapas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            titulo: titulo.trim(),
            conteudo: conteudo.trim(),
            ordem: Number(ordem),
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
        setErro(dados.mensagem || "Não foi possível criar a etapa");
        setCarregando(false);
        return;
      }

      const etapaId = dados.etapa.id;

      console.log("ETAPA CRIADA:", dados);
      console.log("ID DA ETAPA:", etapaId);
      console.log("ARQUIVOS SELECIONADOS:", arquivos);

      for (const arquivo of arquivos) {
        console.log("ENVIANDO MÍDIA:", arquivo.name);

        const formulario = new FormData();
        formulario.append("arquivo", arquivo);

        const respostaMidia = await fetch(
          `http://localhost:3000/api/projetos/${projetoId}/etapas/${etapaId}/midias`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formulario,
          },
        );

        const textoResposta = await respostaMidia.text();

        let dadosMidia: {
          mensagem?: string;
          midia?: unknown;
        } = {};

        try {
          dadosMidia = JSON.parse(textoResposta);
        } catch {
          dadosMidia = {
            mensagem: textoResposta,
          };
        }

        console.log("RESPOSTA DA MÍDIA:", dadosMidia);

        if (!respostaMidia.ok) {
          setErro(
            dadosMidia.mensagem ||
              `Não foi possível enviar a mídia ${arquivo.name}`,
          );
          setCarregando(false);
          return;
        }
      }

      setTitulo("");
      setConteudo("");
      setOrdem("");
      setArquivos([]);
      setErro("");
      setCarregando(false);

      console.log("Etapa criada com sucesso!");
    } catch (error) {
      console.error(error);
      setErro("Erro ao conectar com o servidor");
      setCarregando(false);
    }
  }

  return (
    <section className="etapas-topo">
      <main className="criar-etapa">
        <div className="criar-etapa-conteudo">
          <h1>Projeto: {projetoTitulo}</h1>

          <h2>Criar etapas do projeto</h2>

          <input
            type="text"
            placeholder="Título da etapa"
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
          />

          <textarea
            placeholder="Conteúdo da etapa"
            value={conteudo}
            onChange={(evento) => setConteudo(evento.target.value)}
          />

          <input
            type="number"
            placeholder="Ordem"
            value={ordem}
            onChange={(evento) => setOrdem(evento.target.value)}
          />

          <label className="botao-arquivos-etapa">
            Escolher imagens ou vídeos
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={selecionarArquivos}
            />
          </label>

          {arquivos.length > 0 && (
            <div className="preview-arquivos-etapa">
              {arquivos.map((arquivo, indice) => {
                const previewUrl = URL.createObjectURL(arquivo);

                return (
                  <div
                    className="preview-arquivo-etapa"
                    key={`${arquivo.name}-${indice}`}
                  >
                    {arquivo.type.startsWith("image/") && (
                      <img src={previewUrl} alt={arquivo.name} />
                    )}

                    {arquivo.type.startsWith("video/") && (
                      <video src={previewUrl} controls />
                    )}

                    <span>{arquivo.name}</span>
                  </div>
                );
              })}
            </div>
          )}

          {erro && <p>{erro}</p>}

          <button onClick={criarEtapas} disabled={carregando}>
            {carregando ? "Criando etapa..." : "Criar etapa"}
          </button>
        </div>
      </main>
    </section>
  );
}
