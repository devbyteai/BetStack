import { baseApi } from '@/store/api';
import type {
  Banner,
  BannersQuery,
  News,
  NewsListQuery,
  NewsListResponse,
  InfoPage,
  FranchiseInquiryRequest,
  FranchiseInquiryResponse,
} from '../types';

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get banners
    getBanners: builder.query<Banner[], BannersQuery | void>({
      query: (params) => ({
        url: '/content/banners',
        params: params || {},
      }),
      providesTags: ['Banners'],
    }),

    // Get news list
    getNewsList: builder.query<NewsListResponse, NewsListQuery | void>({
      query: (params) => ({
        url: '/content/news',
        params: params || {},
      }),
      providesTags: ['News'],
    }),

    // Get single news article
    getNewsById: builder.query<News, string>({
      query: (id) => `/content/news/${id}`,
    }),

    // Get news categories
    getNewsCategories: builder.query<string[], void>({
      query: () => '/content/news/categories',
    }),

    // Get info page
    getInfoPage: builder.query<InfoPage, string>({
      query: (slug) => `/content/info/${slug}`,
    }),

    // Submit franchise inquiry
    submitFranchiseInquiry: builder.mutation<FranchiseInquiryResponse, FranchiseInquiryRequest>({
      query: (data) => ({
        url: '/content/franchise',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetBannersQuery,
  useGetNewsListQuery,
  useGetNewsByIdQuery,
  useGetNewsCategoriesQuery,
  useGetInfoPageQuery,
  useSubmitFranchiseInquiryMutation,
} = contentApi;
