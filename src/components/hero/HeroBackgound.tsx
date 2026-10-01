import "./HeroBackground.css";
import Prism from "../ui/prisma";

export default function HeroBackground() {
  return (
    <div className="hero-background">
      <Prism
        animationType="rotate"
        timeScale={0.35}
        height={3}
        baseWidth={5}
        scale={3}
        hueShift={0}
        colorFrequency={1.2}
        noise={0.08}
        glow={0.70}
        bloom={1.4}
        transparent={true}
      />
    </div>
  );
}