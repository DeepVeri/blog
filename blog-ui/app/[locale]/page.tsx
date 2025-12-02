import { Metadata } from 'next';
import HomeClient from './HomeClient';
import { API_BASE } from '@/lib/apiConfig';

export type ArticleCard = {
  id: string;
  title: string;
  excerpt: string;
  category: string;     // 分类名称
  categoryId: string;   // 分类ID
  tags: string[];       // 标签数组
  date: string;
  readTime: string;
  slug: string;
};

// 服务端获取初始文章数据

const formatDate = (value: string | undefined): string => {
  if (!value) return '待发布';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未知日期';
  return date.toISOString().split('T')[0];
};

// 简单的 Markdown 去除工具
function stripMarkdown(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接保留文本
    .replace(/#{1,6}\s/g, '') // 移除标题
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // 移除粗体
    .replace(/(\*|_)(.*?)\1/g, '$2') // 移除斜体
    .replace(/`{3}[\s\S]*?`{3}/g, '') // 移除代码块
    .replace(/`(.+?)`/g, '$1') // 移除行内代码
    .replace(/>\s/g, '') // 移除引用
    .replace(/(-|\*|\+)\s/g, '') // 移除列表符
    .replace(/\n/g, ' ') // 换行转空格
    .replace(/\s+/g, ' ') // 合并空格
    .trim();
}

// 服务端获取文章（SEO 友好）
async function getArticles(): Promise<{ articles: ArticleCard[]; hasMore: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/articles?page=0&size=6&sort=createTime,desc`, {
      next: { revalidate: 60 } // 60秒缓存
    });
    if (!res.ok) throw new Error('加载失败');
    const payload = await res.json();
    const articles = (payload.content || []).map((article: any) => ({
      id: article.articleId || article.id,
      title: article.title,
      excerpt: article.summary?.trim() || stripMarkdown(article.content)?.slice(0, 120) || '暂无描述',
      category: article.category?.name || '未分类',
      categoryId: article.category?.categoryId || '',
      tags: (article.tags || []).map((t: any) => t.name),
      date: formatDate(article.publishedAt),
      readTime: article.readTime || '待补充阅读时长',
      slug: article.articleId || article.id
    }));
    return { articles, hasMore: payload.last === false };
  } catch {
    return { articles: [], hasMore: false };
  }
}

// 动态生成页面 metadata（SEO）
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'DeepVeir Blog · 深度思考与技术探索',
    description: '分享关于技术架构、AI 应用与产品设计的深度见解。探索最新的 AI 技术、前端开发、系统架构等领域的专业文章。',
    keywords: ['技术博客', 'AI', '前端开发', '系统架构', '产品设计', 'DeepVeir'],
    openGraph: {
      title: 'DeepVeir Blog · 深度思考与技术探索',
      description: '分享关于技术架构、AI 应用与产品设计的深度见解。',
      type: 'website',
      locale: 'zh_CN',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'DeepVeir Blog',
      description: '分享关于技术架构、AI 应用与产品设计的深度见解。',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// 服务端组件（SSR）
export default async function Home({ params }: { params: { locale: string } }) {
  const { articles, hasMore } = await getArticles();
  const locale = params.locale || 'zh';

  return (
    <>
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'DeepVeir Blog',
            description: '分享关于技术架构、AI 应用与产品设计的深度见解。',
            url: 'https://deepveir.com',
            blogPost: articles.slice(0, 6).map(article => ({
              '@type': 'BlogPosting',
              headline: article.title,
              description: article.excerpt,
              datePublished: article.date,
            })),
          }),
        }}
      />
      <HomeClient initialArticles={articles} initialHasMore={hasMore} locale={locale} />
    </>
  );
}
