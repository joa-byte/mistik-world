import type { Project } from '../types/project';

function getApiUrl() {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error('Missing VITE_API_URL environment variable');
  }

  return apiUrl;
}

export async function fetchPublishedProjects(): Promise<Project[]> {
  const response = await fetch(`${getApiUrl()}/public/projects`);

  if (!response.ok) {
    throw new Error('Could not load products');
  }

  return response.json();
}

export async function fetchPublishedProject(slug: string): Promise<Project> {
  const response = await fetch(
    `${getApiUrl()}/public/projects/${encodeURIComponent(slug)}`,
  );

  if (!response.ok) {
    throw new Error(
      response.status === 404 ? 'Product not found' : 'Could not load product',
    );
  }

  return response.json();
}
