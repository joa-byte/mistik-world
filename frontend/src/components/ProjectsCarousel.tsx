import type { Project } from '../types/project';

type ProjectsCarouselProps = {
  projects: Project[];
};

const money = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export function ProjectsCarousel({ projects }: ProjectsCarouselProps) {
  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <a className="brand" href="/">
          MISTIK WORLD
        </a>
        <span className="catalog-header__label">Productos</span>
      </header>

      <section className="catalog-grid" aria-label="Productos">
        {projects.map((project) => (
          <a className="catalog-card" href={`/projects/${project.slug}`} key={project.id}>
            <div className="catalog-card__image">
              {project.coverImage ? (
                <img
                  src={project.coverImage.url}
                  alt={project.coverImage.alt ?? project.title}
                />
              ) : (
                <span className="project-cover__fallback">{project.title}</span>
              )}
            </div>
            <div className="catalog-card__meta">
              <span>{project.title}</span>
              <span>{project.price === null ? 'Consultar' : money.format(project.price)}</span>
            </div>
          </a>
        ))}
      </section>
    </main>
  );
}
