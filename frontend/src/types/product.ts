export type ProductImage = {
  id?: string;
  url: string;
  alt: string | null;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  price: number | null;
  sizes: number[];
  coverImage: ProductImage | null;
  images?: ProductImage[];
};
