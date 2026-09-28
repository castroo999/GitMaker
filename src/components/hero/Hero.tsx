import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";
import { iniciarAnimacaoHero } from "./HeroAnimation";
import HeroBackground from "./HeroBackgound";

const palavras = [
  "Compartilhe seus projetos",
  "Compartilhe suas ideias",
  "Compartilhe seus conhecimentos",
  "Compartilhe suas experiências",
];

export default function Hero() {
  const [indice, setIndice] = useState(0);
  const [textoDigitado, setTextoDigitado] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const cleanup = iniciarAnimacaoHero();
    return cleanup;
  }, []);

  useEffect(() => {
  const palavraAtual = palavras[indice];

  setTextoDigitado("");

  let posicao = 0;

  const intervalo = window.setInterval(() => {
    setTextoDigitado(palavraAtual.slice(0, posicao + 1));

    posicao++;

    if (posicao === palavraAtual.length) {
      window.clearInterval(intervalo);
    }
  }, 100);

  return () => {
    window.clearInterval(intervalo);
  };
}, [indice]);

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setIndice((anterior) => (anterior + 1) % palavras.length);
    }, 3500);

    return () => {
      window.clearInterval(intervalo);
    };
  }, []);

  return (
    <section className="hero">
      <HeroBackground />

      <div className="hero-conteudo">
        <div className="hero-logo">
          <TextHoverEffect text="GIT MAKER" duration={0.5} />
        </div>

        <h1 className="hero-titulo">
          {textoDigitado}
          <span className="hero-cursor">|</span>
        </h1>

        <p className="hero-descricao">
          Documente seus projetos, compartilhe seu conhecimento e ajude outras
          pessoas a reproduzi-los.
        </p>
        <div className="hero-botoes">
          <button
            className="botao-principal"
            onClick={() => navigate("/login")}
          >
            Explorar projetos
          </button>

          <button
            className="botao-secundario"
            onClick={() => navigate("/login")}
          >
            Criar projeto
          </button>
        </div>
      </div>
    </section>
  );
}
