export type BannerPosition = 'home' | 'casino' | 'sports' | 'featured';

export interface Banner {
  id: string;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  position: BannerPosition;
  order: number;
  isActive: boolean;
}

export interface News {
  id: string;
  title: string;
  content: string;
  thumbnail: string | null;
  category: string | null;
  publishedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

export interface NewsListItem {
  id: string;
  title: string;
  thumbnail: string | null;
  category: string | null;
  publishedAt: Date | null;
  excerpt: string;
}

export interface InfoPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  isActive: boolean;
}

export interface BannersQuery {
  position?: BannerPosition;
}

export interface NewsListQuery {
  category?: string;
  limit?: number;
  offset?: number;
}

export interface NewsListResponse {
  news: NewsListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface FranchiseInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  message: string;
  createdAt: Date;
}

export interface CreateFranchiseInquiryRequest {
  name: string;
  email: string;
  phone: string;
  location: string;
  message: string;
}
