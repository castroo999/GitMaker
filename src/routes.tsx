import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hero from "./components/hero/Hero";
import Login from "./pages/login/Login";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hero />} />

        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
