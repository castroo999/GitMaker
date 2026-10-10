export interface Comunidade {
  id: number;
  nome: string;
  descricao: string;
  tipoEntrada: string;
  createdAt: string;
  creator: {
    id: number;
    nome: string;
  };
  _count: {
    membros: number;
    posts: number;
  };
}

export interface Membro {
  id: number;
  userId: number;
  statusContribuicao?: string;
  user: {
    id: number;
    nome: string;
  };
}

export interface Publicacao {
  id: number;
  titulo: string;
  conteudo: string;
  createdAt: string;
  author?: {
    id: number;
    nome: string;
  };
  user?: {
    id: number;
    nome: string;
  };
  midias?: {
    id: number;
    nome: string;
    tipo: string;
    url: string;
  }[];
}

export interface ProjetoComunidade {
  id: number;
  titulo: string;
  descricao: string;
  statusAprovacao?: string;
  createdAt: string;
  user: {
    id: number;
    nome: string;
  };
}

export type AbaComunidade = "publicacoes" | "membros" | "projetos";
