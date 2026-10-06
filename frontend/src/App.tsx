import { useEffect, useState } from 'react';
import {
  fetchPublishedProject,
  fetchPublishedProjects,
} from './api/projects';
import { ProductDetail } from './components/ProductDetail';
import { ProjectsCarousel } from './components/ProjectsCarousel';
import type { Project } from './types/project';

type AppState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      projects: Project[];
      product?: Project;
    };

function currentProductSlug() {
  const match = window.location.pathname.match(/^\/projects\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function App() {
  const [state, setState] = useState<AppState>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;
    const slug = currentProductSlug();

    const request = slug
      ? Promise.all([fetchPublishedProjects(), fetchPublishedProject(slug)]).then(
          ([projects, product]) => ({ projects, product }),
        )
      : fetchPublishedProjects().then((projects) => ({ projects }));

    request
      .then((data) => {
        if (isMounted) {
          setState({ status: 'ready', ...data });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setState({
            status: 'error',
            message:
              error instanceof Error ? error.message : 'Could not load products',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (state.status === 'loading') {
    return <main className="screen-state">Cargando...</main>;
  }

  if (state.status === 'error') {
    return <main className="screen-state">{state.message}</main>;
  }

  if (state.product) {
    return (
      <ProductDetail product={state.product} products={state.projects} />
    );
  }

  if (state.projects.length === 0) {
    return <main className="screen-state">Todavía no hay productos publicados.</main>;
  }

  return <ProjectsCarousel projects={state.projects} />;
}
