import type { Product } from '../types/product';

function getApiUrl() {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error('Missing VITE_API_URL environment variable');
  }

  return apiUrl;
}

export async function fetchPublishedProducts(): Promise<Product[]> {
  const response = await fetch(`${getApiUrl()}/public/products`);

  if (!response.ok) {
    throw new Error('Could not load products');
  }

  return response.json();
}

export async function fetchPublishedProduct(slug: string): Promise<Product> {
  const response = await fetch(
    `${getApiUrl()}/public/products/${encodeURIComponent(slug)}`,
  );

  if (!response.ok) {
    throw new Error(
      response.status === 404 ? 'Product not found' : 'Could not load product',
    );
  }

  return response.json();
}
