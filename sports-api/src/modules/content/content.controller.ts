import type { Request, Response, NextFunction } from 'express';
import { contentService } from './content.service.js';
import type { BannersQueryInput, NewsListQueryInput, FranchiseInquiryInput } from './content.schema.js';

export class ContentController {
  async getBanners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { position } = req.query as unknown as BannersQueryInput;
      const banners = await contentService.getBanners(position);

      res.json({
        success: true,
        data: banners,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNewsList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as NewsListQueryInput;
      const result = await contentService.getNewsList(query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNewsById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const news = await contentService.getNewsById(id);

      res.json({
        success: true,
        data: news,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNewsCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await contentService.getNewsCategories();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInfoPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const infoPage = await contentService.getInfoPageBySlug(slug);

      res.json({
        success: true,
        data: infoPage,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitFranchiseInquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as FranchiseInquiryInput;
      const inquiry = await contentService.submitFranchiseInquiry(data);

      res.status(201).json({
        success: true,
        data: inquiry,
        message: 'Your franchise inquiry has been submitted successfully. We will contact you soon.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const contentController = new ContentController();
