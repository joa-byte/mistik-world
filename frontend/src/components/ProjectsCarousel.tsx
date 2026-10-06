import type { Project } from '../types/project';

type ProjectsCarouselProps = {
  projects: Project[];
};

export function ProjectsCarousel({ projects }: ProjectsCarouselProps) {
  return (
    <main className="projects-carousel" aria-label="Published projects">
      {projects.map((project) => (
        <a
          className="project-cover"
          href={`/projects/${project.slug}`}
          key={project.id}
          onClick={() => console.log(project.slug)}
        >
          {project.coverImage ? (
            <img
              src={project.coverImage.url}
              alt={project.coverImage.alt ?? project.title}
            />
          ) : (
            <span className="project-cover__fallback">{project.title}</span>
          )}
        </a>
      ))}
    </main>
  );
}
