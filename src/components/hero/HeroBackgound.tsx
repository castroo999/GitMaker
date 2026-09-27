import { useEffect } from "react";
import { tsParticles } from "@tsparticles/engine";
import { loadLinksPreset } from "@tsparticles/preset-links";
import type { Container } from "@tsparticles/engine";

export default function HeroBackground() {
  useEffect(() => {
    let container: Container | undefined;
    let ativo = true;

    async function iniciar() {
      await loadLinksPreset(tsParticles);

      if (!ativo) return;

      container = await tsParticles.load({
        id: "tsparticles",

        options: {
          fullScreen: {
            enable: false,
          },

          background: {
            color: "#0B0B0F",
          },

          particles: {
            number: {
              value: 85,
              density: {
                enable: true,
              },
            },

            color: {
              value: "#7C3AED",
            },

            opacity: {
              value: {
                min: 0.35,
                max: 0.8,
              },
            },

            size: {
              value: {
                min: 1.5,
                max: 3.5,
              },
            },

            move: {
              enable: true,
              speed: 1,
              random: true,
              outModes: {
                default: "out",
              },
            },

            links: {
              enable: true,
              distance: 170,
              color: "#7C3AED",
              opacity: 0.35,
              width: 1.2,
            },
          },

          interactivity: {
            detectsOn: "window",

            events: {
              onHover: {
                enable: true,
                mode: "grab",
              },
            },

            modes: {
              grab: {
                distance: 220,

                links: {
                  opacity: 0.7,
                },
              },
            },
          },

          detectRetina: true,
        },
      });
    }

    iniciar();

    return () => {
      ativo = false;
      container?.destroy();
    };
  }, []);

  return <div id="tsparticles" className="hero-background" />;
}
