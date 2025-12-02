import { API_BASE } from '@/lib/apiConfig';
import Link from 'next/link';
import './category-detail.css';

interface Article {
  id: string;
  articleId: string;
  title: string;
  summary: string;
  publishedAt: string;
  tags: { name: string }[];
}

interface Category {
  id: string;
  categoryId: string;
  name: string;
  description: string;
}

async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const res = await fetch(`${API_BASE}/api/categories`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return null;
    const categories: Category[] = await res.json();
    return categories.find(c => c.categoryId === slug) || null;
  } catch {
    return null;
  }
}

async function getArticlesByCategory(categoryId: string): Promise<Article[]> {
  try {
    const res = await fetch(`${API_BASE}/api/articles?categoryId=${categoryId}&size=50`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.content || [];
  } catch {
    return [];
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '待发布';
  return new Date(dateStr).toISOString().split('T')[0];
}

export default async function CategoryDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const { locale, slug } = params;
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    return (
      <div className="category-detail-page">
        <div className="category-header">
          <h1>分类不存在</h1>
          <p>抱歉，您访问的分类不存在。</p>
          <Link href={`/${locale}/categories`} className="back-link">
            ← 返回分类列表
          </Link>
        </div>
      </div>
    );
  }

  const articles = await getArticlesByCategory(category.categoryId);

  return (
    <div className="category-detail-page">
      <div className="category-header">
        <Link href={`/${locale}/categories`} className="back-link">
          ← 返回分类列表
        </Link>
        <h1>{category.name}</h1>
        {category.description && <p className="category-desc">{category.description}</p>}
        <span className="article-count">{articles.length} 篇文章</span>
      </div>

      <div className="articles-list">
        {articles.length === 0 ? (
          <p className="no-articles">该分类下暂无文章</p>
        ) : (
          articles.map((article) => (
            <Link
              key={article.id}
              href={`/${locale}/article/${article.articleId}`}
              className="article-item"
            >
              <div className="article-info">
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <div className="article-meta">
                  <span className="date">{formatDate(article.publishedAt)}</span>
                  {article.tags?.length > 0 && (
                    <div className="tags">
                      {article.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="tag">{tag.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
