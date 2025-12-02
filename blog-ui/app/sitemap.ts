import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.deepveir.com';
const API_BASE = 'https://api.deepveir.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/zh`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/zh/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/en/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 动态获取文章列表
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE}/api/articles?size=1000`, {
      cache: 'no-store',
    });
    
    if (res.ok) {
      const data = await res.json();
      const articles = data.content || data || [];
      
      articlePages = articles.map((article: any) => ({
        url: `${BASE_URL}/zh/articles/${article.slug || article.id}`,
        lastModified: article.updateTime ? new Date(article.updateTime) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

      // 英文版文章
      const enArticlePages = articles.map((article: any) => ({
        url: `${BASE_URL}/en/articles/${article.slug || article.id}`,
        lastModified: article.updateTime ? new Date(article.updateTime) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

      articlePages = [...articlePages, ...enArticlePages];
    }
  } catch (error) {
    console.error('Failed to fetch articles for sitemap:', error);
  }

  // 动态获取分类列表
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE}/api/categories`, {
      cache: 'no-store',
    });
    
    if (res.ok) {
      const categories = await res.json();
      
      categoryPages = categories.flatMap((category: any) => [
        {
          url: `${BASE_URL}/zh/categories/${category.slug || category.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        },
        {
          url: `${BASE_URL}/en/categories/${category.slug || category.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        },
      ]);
    }
  } catch (error) {
    console.error('Failed to fetch categories for sitemap:', error);
  }

  return [...staticPages, ...articlePages, ...categoryPages];
}
