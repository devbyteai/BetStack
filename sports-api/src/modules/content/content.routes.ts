import { Router } from 'express';
import { contentController } from './content.controller.js';
import { validateQuery, validateParams, validateBody } from '../../shared/middleware/index.js';
import { bannersQuerySchema, newsListQuerySchema, newsIdParamSchema, infoSlugParamSchema, franchiseInquirySchema } from './content.schema.js';

const router = Router();

// Banners
router.get(
  '/banners',
  validateQuery(bannersQuerySchema),
  contentController.getBanners.bind(contentController)
);

// News
router.get(
  '/news',
  validateQuery(newsListQuerySchema),
  contentController.getNewsList.bind(contentController)
);

// IMPORTANT: Static routes MUST come before parameterized routes
// /news/categories must be before /news/:id to prevent "categories" matching as :id
router.get(
  '/news/categories',
  contentController.getNewsCategories.bind(contentController)
);

router.get(
  '/news/:id',
  validateParams(newsIdParamSchema),
  contentController.getNewsById.bind(contentController)
);

// Info pages
router.get(
  '/info/:slug',
  validateParams(infoSlugParamSchema),
  contentController.getInfoPage.bind(contentController)
);

// Franchise inquiries
router.post(
  '/franchise',
  validateBody(franchiseInquirySchema),
  contentController.submitFranchiseInquiry.bind(contentController)
);

export { router as contentRoutes };
