import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import Sobre from "../sobre/Sobre";
import ConfigModal from '../config/ConfigModal'
import "./Layout.css";

export default function Layout() {
  const [minimizada, setMinimizada] = useState(false);
  const [sobreAberto, setSobreAberto] = useState(false);
  const [configAberta, setConfigAberta] = useState(false);

  return (
    <div className={`layout ${minimizada ? "sidebar-minimizada" : ""}`}>
      <Sidebar
        minimizada={minimizada}
        setMinimizada={setMinimizada}
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
