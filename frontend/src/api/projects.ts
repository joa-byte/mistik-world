import type { Project } from '../types/project';

export async function fetchPublishedProjects(): Promise<Project[]> {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error('Missing VITE_API_URL environment variable');
  }

  const response = await fetch(`${apiUrl}/public/projects`);

  if (!response.ok) {
    throw new Error('Could not load published projects');
  }

  return response.json();
}
