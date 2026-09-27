import gsap from "gsap";

export function iniciarAnimacaoHero() {
  const titulo = document.querySelector(".hero-titulo");

  if (!titulo) {
    return () => {};
  }

  const animacao = gsap.fromTo(
    titulo,
    {
      opacity: 0,
      y: 30,
    },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
    }
  );

  return () => {
    animacao.kill();
  };
}