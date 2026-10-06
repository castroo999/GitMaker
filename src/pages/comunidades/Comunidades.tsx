import "./Comunidades.css";
import { Search, Plus, ArrowRight } from "lucide-react";

export default function Comunidades() {

    const emDestaque = [
        {
            id: 1,
            nome: 'Serralheria',
            projetos: 36,
            membros: 67,
            categoria: 'DIY, Marcenaria'
        },
        {
            id: 2,
            nome: 'ProgramaClub',
            projetos: 20,
            membros: 12,
            categoria: 'DIY, Tecnologia'
        },
        {
            id: 3,
            nome: 'sitesMakers',
            projetos: 27,
            membros: 7,
            categoria: 'Tecnologia'
        }
    ]

  return (
    <section>
      <div className="comuni-header">
        <h1>Comunidades</h1>
        <p>Encontre pessoas e projetos sobre coisas que você gosta</p>

        <div className="comuni-header-aderecos">
          <div className="comuni-header-busca">
            <input type="text" placeholder="Buscar comunidades..." /> <Search size={16} />
          </div>

          <button className="btn-criar">

            <Plus size={16} /> Criar

          </button>
        </div>

        <div className="comuni-content">
            <h2>Explorar</h2>

            <p>Categorias:</p>

            <div className="comuni-categorias">
                <button> <Plus/> Todas</button>
                <button> <Plus/> Tecnologia</button>
                <button> <Plus/> Eletrônica</button>
                <button> <Plus/> Games</button>
                <button> <Plus/> Marcenaria</button>
                <button> <Plus/> Automóveis</button>
                <button> <Plus/> Arte</button>
                <button> <Plus/> Fitness</button>
                <button> <Plus/> DIY</button>

            </div>

            <div className="em-destaque">

                <h2>Comunidades em destaque: </h2>

                {emDestaque.map((projeto) => (
                    <div key={projeto.id} className="overlay">
                        <h2>{projeto.nome}</h2>
                        <p>Membros: {projeto.membros}</p>
                        <p>Projetos: {projeto.projetos}</p>
                        <p>Categorias: {projeto.categoria}</p> <br/>
                        <button className="entrar">
                            Entrar na comunidade <ArrowRight size={16}/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
}
