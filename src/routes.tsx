import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hero from "./components/hero/Hero";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import CriarProjetos from "./pages/projetos/CriarProjetos";
import DescProjeto from "./pages/descProjetos/DescProjeto";
import SeusProjetos from './pages/seusProjetos/SeusProjetos'
import Comunidades from "./pages/comunidades/Comunidades";
import Layout from "./components/layout/layout";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/criar" element={<CriarProjetos />} />
          <Route path="/meus-projetos" element={<SeusProjetos />} />
          <Route path="/projetos/:id" element={<DescProjeto />} />
          <Route path='comunidades' element={<Comunidades />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
