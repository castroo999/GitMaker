import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "../sidebar/Sidebar";
import Sobre from "../sobre/Sobre";
import ConfigModal from '../config/ConfigModal'
import "./layout.css";

export default function Layout() {
  const [minimizada, setMinimizada] = useState(false);
  const [mobileAberta, setMobileAberta] = useState(false);
  const [sobreAberto, setSobreAberto] = useState(false);
  const [configAberta, setConfigAberta] = useState(false);

  return (
    <div className={`layout ${minimizada ? "sidebar-minimizada" : ""}`}>
      <button
        type="button"
        className="layout-mobile-toggle"
        aria-label={mobileAberta ? "Fechar menu" : "Abrir menu"}
        aria-expanded={mobileAberta}
        onClick={() => setMobileAberta((aberta) => !aberta)}
      >
        {mobileAberta ? <X size={20} /> : <Menu size={20} />}
        <span>GitMaker</span>
      </button>
      {mobileAberta && (
        <button
          type="button"
          className="layout-mobile-overlay"
          aria-label="Fechar menu"
          onClick={() => setMobileAberta(false)}
        />
      )}
      <Sidebar
        minimizada={minimizada}
        setMinimizada={setMinimizada}
        mobileAberta={mobileAberta}
        setMobileAberta={setMobileAberta}
        onAbrirSobre={() => setSobreAberto(true)}
        onAbrirConfiguracoes={() => setConfigAberta(true)}
      />

      <main className="layout-conteudo">
        <Outlet />
      </main>

      {sobreAberto && <Sobre onFechar={() => setSobreAberto(false)} />}

      {configAberta && <ConfigModal onFechar={() => setConfigAberta(false)} />}
    </div>
  );
}
