export type ProjectImage = {
  id?: string;
  url: string;
  alt: string | null;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  year: number | null;
  price: number | null;
  sizes: number[];
  coverImage: ProjectImage | null;
  images?: ProjectImage[];
};
