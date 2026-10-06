import { useEffect, useState } from 'react';
import { fetchPublishedProjects } from './api/projects';
import { ProjectsCarousel } from './components/ProjectsCarousel';
import type { Project } from './types/project';

type ProjectsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; projects: Project[] };

export default function App() {
  const [state, setState] = useState<ProjectsState>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;

    fetchPublishedProjects()
      .then((projects) => {
        if (isMounted) {
          setState({ status: 'ready', projects });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setState({
            status: 'error',
            message:
              error instanceof Error ? error.message : 'Could not load projects',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (state.status === 'loading') {
    return <main className="screen-state">Loading projects...</main>;
  }

  if (state.status === 'error') {
    return <main className="screen-state">{state.message}</main>;
  }

  if (state.projects.length === 0) {
    return <main className="screen-state">No published projects yet.</main>;
  }

  return <ProjectsCarousel projects={state.projects} />;
}
