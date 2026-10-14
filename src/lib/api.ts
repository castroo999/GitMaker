const apiBaseUrl = (
  import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.DEV ? "http://localhost:3000" : "")
).replace(/\/+$/, "");

export function apiUrl(path: string): string {
  if (!apiBaseUrl) {
    throw new Error(
      "API não configurada. Defina VITE_API_URL com a URL pública do backend no Render.",
    );
  }

  if (!import.meta.env.DEV && !apiBaseUrl.startsWith("https://")) {
    throw new Error("A URL da API publicada precisa usar HTTPS.");
  }

  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
