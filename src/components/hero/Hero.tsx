import "./Hero.css";
import { useEffect, useState } from "react";
import { iniciarAnimacaoHero } from "./HeroAnimation";
import  { useNavigate } from 'react-router-dom'
import HeroBackground from './HeroBackgound'

const palavras = [
  "seus projetos",
  "suas ideias",
  "seus conhecimentos",
  "suas experiências",
];

export default function Hero() {
  const [indice, setIndice] = useState(0);

  const navigate = useNavigate()

  useEffect(() => {
    const cleanup = iniciarAnimacaoHero();

    return cleanup;
  }, []);

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setIndice((anterior) => {
        return (anterior + 1) % palavras.length;
      });
    }, 2500);

    return () => {
      window.clearInterval(intervalo);
    };
  }, []);

  

  return (
    <section className="hero">
      <HeroBackground />
      
      <div className="hero-conteudo">
        <h1 className="hero-titulo">
          Compartilhe {" "}
          <span className="hero-palavra">
            {palavras[indice]}
          </span>
        </h1>

        <p className="hero-descricao">
          Documente seus projetos, compartilhe seu conhecimento
          e ajude outras pessoas a reproduzi-los.
        </p>

        <div className="hero-botoes">
          <button className="botao-principal" onClick={() => navigate('/login')}>
            Explorar projetos
          </button>

          <button className="botao-secundario" onClick={() => navigate('/login')}>
            Criar projeto
          </button>
        </div>
      </div>
    </section>
  );
}