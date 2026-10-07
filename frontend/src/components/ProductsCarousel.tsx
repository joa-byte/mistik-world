import type { Product } from '../types/product';

type ProductsCarouselProps = {
  products: Product[];
};

export function ProductsCarousel({ products }: ProductsCarouselProps) {
  return (
    <main className="projects-carousel" aria-label="Published products">
      {products.map((product) => (
        <a
          className="project-cover"
          href={`/products/${product.slug}`}
          key={product.id}
        >
          {product.coverImage ? (
            <img
              src={product.coverImage.url}
              alt={product.coverImage.alt ?? product.title}
            />
          ) : (
            <span className="project-cover__fallback">{product.title}</span>
          )}
        </a>
      ))}
    </main>
  );
}
