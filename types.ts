
export interface Profile {
  avatar: string;
  name: string;
  bio: string;
  email: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  link: string;
  createdAt: number;
  isFeatured?: boolean;
  featuredAt?: number;
}

export interface PortfolioData {
  profile: Profile;
  projects: Project[];
  categories: string[];
}
