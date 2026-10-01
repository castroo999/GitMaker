import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from '../sidebar/Sidebar'
import "./Layout.css";

export default function Layout() {
  const [minimizada, setMinimizada] = useState(false);

  return (
    <div className={`layout ${minimizada ? "sidebar-minimizada" : ""}`}>
      <Sidebar
        minimizada={minimizada}
        setMinimizada={setMinimizada}
      />
      <main className="layout-conteudo">
        <Outlet />
      </main>
    </div>
  );
}