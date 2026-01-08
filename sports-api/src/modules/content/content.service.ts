import { db } from '../../config/database.js';
import { NotFoundError } from '../../shared/errors/AppError.js';
import type {
  Banner,
  BannerPosition,
  News,
  NewsListItem,
  NewsListQuery,
  NewsListResponse,
  InfoPage,
  FranchiseInquiry,
  CreateFranchiseInquiryRequest,
} from './content.types.js';

interface DbBanner {
  id: string;
  title: string | null;
  image_url: string;
  link_url: string | null;
  position: BannerPosition;
  order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface DbNews {
  id: string;
  title: string;
  content: string;
  thumbnail: string | null;
  category: string | null;
  published_at: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface DbInfoPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface DbFranchiseInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  message: string;
  created_at: Date;
}

export class ContentService {
  private mapDbBannerToBanner(dbBanner: DbBanner): Banner {
    return {
      id: dbBanner.id,
      title: dbBanner.title,
      imageUrl: dbBanner.image_url,
      linkUrl: dbBanner.link_url,
      position: dbBanner.position,
      order: dbBanner.order,
      isActive: dbBanner.is_active,
    };
  }

  private mapDbNewsToNews(dbNews: DbNews): News {
    return {
      id: dbNews.id,
      title: dbNews.title,
      content: dbNews.content,
      thumbnail: dbNews.thumbnail,
      category: dbNews.category,
      publishedAt: dbNews.published_at,
      isActive: dbNews.is_active,
      createdAt: dbNews.created_at,
    };
  }

  private mapDbNewsToListItem(dbNews: DbNews): NewsListItem {
    const excerpt = dbNews.content.length > 150
      ? dbNews.content.substring(0, 150) + '...'
      : dbNews.content;

    return {
      id: dbNews.id,
      title: dbNews.title,
      thumbnail: dbNews.thumbnail,
      category: dbNews.category,
      publishedAt: dbNews.published_at,
      excerpt,
    };
  }

  private mapDbInfoPageToInfoPage(dbInfoPage: DbInfoPage): InfoPage {
    return {
      id: dbInfoPage.id,
      slug: dbInfoPage.slug,
      title: dbInfoPage.title,
      content: dbInfoPage.content,
      isActive: dbInfoPage.is_active,
    };
  }

  async getBanners(position?: BannerPosition): Promise<Banner[]> {
    let query = db<DbBanner>('banners').where('is_active', true);

    if (position) {
      query = query.where('position', position);
    }

    const banners = await query.orderBy('order', 'asc');

    return banners.map((b) => this.mapDbBannerToBanner(b));
  }

  async getNewsList(query: NewsListQuery): Promise<NewsListResponse> {
    const { category, limit = 20, offset = 0 } = query;

    let baseQuery = db<DbNews>('news')
      .where('is_active', true)
      .whereNotNull('published_at')
      .where('published_at', '<=', new Date());

    if (category) {
      baseQuery = baseQuery.where('category', category);
    }

    const countResult = await baseQuery.clone().count('id as count').first() as { count: string } | undefined;
    const total = parseInt(countResult?.count || '0', 10);

    const news = await baseQuery
      .orderBy('published_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      news: news.map((n) => this.mapDbNewsToListItem(n)),
      total,
      limit,
      offset,
    };
  }

  async getNewsById(newsId: string): Promise<News> {
    const news = await db<DbNews>('news')
      .where('id', newsId)
      .where('is_active', true)
      .first();

    if (!news) {
      throw new NotFoundError('News article not found');
    }

    return this.mapDbNewsToNews(news);
  }

  async getNewsCategories(): Promise<string[]> {
    const categories = await db('news')
      .where('is_active', true)
      .whereNotNull('category')
      .distinct('category')
      .orderBy('category', 'asc');

    return categories.map((c) => c.category).filter(Boolean);
  }

  async getInfoPageBySlug(slug: string): Promise<InfoPage> {
    const infoPage = await db<DbInfoPage>('info_pages')
      .where('slug', slug)
      .where('is_active', true)
      .first();

    if (!infoPage) {
      throw new NotFoundError('Page not found');
    }

    return this.mapDbInfoPageToInfoPage(infoPage);
  }

  private mapDbFranchiseInquiryToFranchiseInquiry(dbInquiry: DbFranchiseInquiry): FranchiseInquiry {
    return {
      id: dbInquiry.id,
      name: dbInquiry.name,
      email: dbInquiry.email,
      phone: dbInquiry.phone,
      location: dbInquiry.location,
      message: dbInquiry.message,
      createdAt: dbInquiry.created_at,
    };
  }

  async submitFranchiseInquiry(data: CreateFranchiseInquiryRequest): Promise<FranchiseInquiry> {
    const [inquiry] = await db<DbFranchiseInquiry>('franchise_inquiries')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        message: data.message,
      })
      .returning('*');

    return this.mapDbFranchiseInquiryToFranchiseInquiry(inquiry);
  }
}

export const contentService = new ContentService();
