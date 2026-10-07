import { useEffect, useState } from 'react';
import { fetchPublishedProducts } from './api/products';
import { ProductsCarousel } from './components/ProductsCarousel';
import type { Product } from './types/product';

type ProductsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; products: Product[] };

export default function App() {
  const [state, setState] = useState<ProductsState>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;

    fetchPublishedProducts()
      .then((products) => {
        if (isMounted) {
          setState({ status: 'ready', products });
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
    return <main className="screen-state">Loading products...</main>;
  }

  if (state.status === 'error') {
    return <main className="screen-state">{state.message}</main>;
  }

  if (state.products.length === 0) {
    return <main className="screen-state">No published products yet.</main>;
  }

  return <ProductsCarousel products={state.products} />;
}
