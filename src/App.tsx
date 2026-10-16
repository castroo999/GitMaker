import { useEffect } from "react";
import "./App.css";
import "./responsividade.css";
import AppRoutes from "./routes";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  useEffect(() => {
    const temaSalvo = localStorage.getItem("gitmaker-theme");
    document.documentElement.dataset.theme =
      temaSalvo === "light" ? "light" : "dark";
  }, []);

  return (
    <>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
    </>
  );
}
