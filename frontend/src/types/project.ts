export type ProjectImage = {
  url: string;
  alt: string | null;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  year: number | null;
  coverImage: ProjectImage | null;
};
