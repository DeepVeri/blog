"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArticleCard } from './page';
import { API_BASE } from '@/lib/apiConfig';

const formatDate = (value: string | undefined): string => {
  if (!value) return '待发布';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未知日期';
  return date.toISOString().split('T')[0];
};

// 简单的 Markdown 去除工具（客户端副本）
function stripMarkdown(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`{3}[\s\S]*?`{3}/g, '')
    .replace(/`(.+?)`/g, '$1')
    .replace(/>\s/g, '')
    .replace(/(-|\*|\+)\s/g, '')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface HomeClientProps {
  initialArticles: ArticleCard[];
  initialHasMore: boolean;
  locale: string;
}

export default function HomeClient({ initialArticles, initialHasMore, locale }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [articles, setArticles] = useState<ArticleCard[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const router = useRouter();
  const pageSize = 6;

  const filteredPosts = useMemo(() => {
    return articles.filter(post => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = activeTag ? post.tag === activeTag : true;
      return matchesSearch && matchesTag;
    });
  }, [articles, activeTag, searchQuery]);

  const isFiltering = searchQuery.length > 0 || activeTag !== null;
  const visiblePosts = isFiltering ? filteredPosts : articles;

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/articles?page=${nextPage}&size=${pageSize}&sort=createTime,desc`);
      if (!res.ok) throw new Error('加载失败');
      const payload = await res.json();
      const normalized = (payload.content || []).map((article: any) => ({
        id: article.articleId || article.id,
        title: article.title,
        excerpt: article.summary?.trim() || stripMarkdown(article.content)?.slice(0, 120) || '暂无描述',
        tag: article.category?.name || article.tags?.[0]?.name || '未分类',
        date: formatDate(article.publishedAt),
        readTime: article.readTime || '待补充阅读时长',
        slug: article.articleId || article.id
      }));
      setArticles(prev => [...prev, ...normalized]);
      setPage(payload.number ?? nextPage);
      setHasMore(payload.last === false);
    } catch (error) {
      console.error('加载更多失败', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      {/* Hero */}
      <section className="hero">
        <h1>探索、构建与思考</h1>
        <p className="subtitle">
          DeepVeir 的官方博客。<br />
          分享关于技术架构、AI 应用与产品设计的深度见解。
        </p>
        <div className="search-container">
          <input
            type="text"
            id="searchInput"
            placeholder="搜索文章标题或内容..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="actions text-center">
          <button
            className="btn-primary"
            onClick={() => document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' })}
          >
            阅读最新文章 ↓
          </button>
        </div>
      </section>

      {/* Blog Grid */}
      <section id="modules" className="modules">
        {visiblePosts.length === 0 && !loading && (
          <p className="text-center" style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>
            暂无文章
          </p>
        )}
        {visiblePosts.map(post => (
          <article
            key={post.id}
            className="post-card"
            onClick={() => router.push(`/${locale}/article/${post.slug}`)}
          >
            <div className="post-meta">
              <span
                className={`post-tag ${activeTag === post.tag ? 'active' : ''}`}
                onClick={e => {
                  e.stopPropagation();
                  setActiveTag(activeTag === post.tag ? null : post.tag);
                }}
              >
                {post.tag}
              </span>
              <span className="post-date">{post.date}</span>
            </div>
            <h3>{post.title}</h3>
            <p className="post-excerpt">{post.excerpt}</p>
            <div className="post-footer">
              <span className="read-time">{post.readTime}</span>
              <span className="read-more">阅读全文 →</span>
            </div>
          </article>
        ))}
      </section>

      {/* Load More Button */}
      {!isFiltering && hasMore && (
        <div className="load-more-container">
          <button className="btn-secondary" onClick={handleLoadMore} disabled={loading}>
            {loading ? '加载中...' : '加载更多文章'}
          </button>
        </div>
      )}
    </div>
  );
}
