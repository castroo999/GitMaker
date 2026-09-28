import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hero from "./components/hero/Hero";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import CriarProjetos from  './pages/projetos/CriarProjetos'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/criar" element={<CriarProjetos />} />
      </Routes>
    </BrowserRouter>
  );
}