"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Eye, Copy, Check, Loader2 } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import 'highlight.js/styles/atom-one-dark.css';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

const formatDate = (value?: string | null) => {
  if (!value) return "待发布";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未知时间";
  return date.toISOString().split("T")[0];
};

const useArticle = (articleId?: string) => {
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!articleId) return;
    let mounted = true;
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/articles/by-article-id/${articleId}`);
        if (!res.ok) throw new Error("文章不存在");
        const payload = await res.json();
        if (mounted) setArticle(payload);
      } catch (reason: any) {
        if (mounted) setError(reason?.message || "加载失败");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchArticle();
    return () => {
      mounted = false;
    };
  }, [articleId]);

  return { article, loading, error };
};

const useRelatedArticles = (articleId?: string) => {
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!articleId) return;
    let mounted = true;
    const fetchRelated = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/articles/by-article-id/${articleId}/related?limit=4`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) setRelated(data);
        }
      } catch {
        // 静默失败，相关推荐非关键功能
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchRelated();
    return () => {
      mounted = false;
    };
  }, [articleId]);

  return { related, loading };
};

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (Array.isArray(params?.slug) ? params?.slug[0] : params?.slug) as string | undefined;
  const locale = (Array.isArray(params?.locale) ? params?.locale[0] : params?.locale) || "zh";
  const { article, loading, error } = useArticle(slug);
  const { related: relatedArticles } = useRelatedArticles(slug);
  const [views, setViews] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(`article_views_${slug}`);
    const nextViews = stored ? Number(stored) + 1 : Math.floor(Math.random() * (1500 - 800 + 1)) + 800;
    setViews(nextViews);
    localStorage.setItem(`article_views_${slug}`, String(nextViews));
  }, [slug]);

  useEffect(() => {
    if (!article?.content) return;
    
    // 等待 ReactMarkdown 渲染完成
    const timer = setTimeout(() => {
      // rehype-slug 会自动为 h2/h3 添加 id
      const headings = document.querySelectorAll(".article-content h2, .article-content h3");
      const list: { id: string; text: string; level: number }[] = [];
      
      headings.forEach(node => {
        if (node.id) {
          list.push({ 
            id: node.id, 
            text: node.textContent || "", 
            level: node.tagName === "H2" ? 2 : 3 
          });
        }
      });
      setToc(list);

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        { rootMargin: "-100px 0px -66%" }
      );
      headings.forEach(h => observer.observe(h));
      
      return () => observer.disconnect();
    }, 200); // 稍微增加延时确保渲染
    
    return () => clearTimeout(timer);
  }, [article?.content]);

  const tagNames = useMemo(() => {
    if (!article?.tags) return [];
    return article.tags.map((t: any) => t.name).filter(Boolean);
  }, [article]);

  const handleBack = () => {
    router.push(`/${locale}`);
  };

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!slug) {
    return (
      <div className="wrapper py-16 text-center">
        <p>缺少文章标识</p>
        <button className="btn-secondary mt-4" onClick={handleBack}>
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <ProgressBar />

      <div className="article-container">
        {/* Sidebar TOC */}
        <aside className="toc-sidebar">
          <div className="toc-sticky">
            <h3>目录</h3>
            <nav id="toc">
              <ul>
                {toc.length === 0 && !loading && <li style={{ color: "var(--text-secondary)" }}>正文加载后自动生成</li>}
                {toc.map(item => (
                  <li key={item.id} style={{ marginBottom: "10px" }}>
                    <a
                      href={`#${item.id}`}
                      className={activeId === item.id ? "active" : ""}
                      style={{
                        paddingLeft: item.level === 3 ? "20px" : "10px",
                        fontSize: item.level === 3 ? "13px" : "14px"
                      }}
                      onClick={e => {
                        e.preventDefault();
                        document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="article-main">
          {loading && (
            <div className="flex items-center justify-center py-24" style={{ color: "var(--text-secondary)" }}>
              <Loader2 className="mr-2 animate-spin" size={20} /> 正在加载文章...
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-16">
              <p style={{ color: "#dc3545" }}>{error}</p>
              <button className="btn-secondary mt-4" onClick={handleBack}>
                返回首页
              </button>
            </div>
          )}

          {!loading && !error && article && (
            <>
              <header className="article-header">
                <Link href={`/${locale}`} className="back-link">
                  ← 返回文章列表
                </Link>
                <h1>{article.title}</h1>
                <div className="article-meta">
                  <span className="post-tag">{article.category?.name || tagNames[0] || "未分类"}</span>
                  <span>{formatDate(article.publishedAt)}</span>
                  <span>{article.readTime || "阅读时长待补充"}</span>
                  <span className="view-count">
                    <Eye size={16} className="opacity-70" />
                    <span>{views} views</span>
                  </span>
                </div>
              </header>

              <article className="article-content">
                {article.summary && (
                  <p style={{ fontStyle: "italic", color: "var(--text-secondary)", marginBottom: "32px" }}>
                    {article.summary}
                  </p>
                )}

                {article.coverImage && (
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="zoomable cursor-zoom-in rounded-lg my-10 hover:scale-[1.02] transition-transform"
                    onClick={e => setLightboxImg((e.target as HTMLImageElement).src)}
                  />
                )}

                {article.content ? (
                  <div className="prose dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
                      components={{
                        pre: ({ children }) => (
                          <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-[#282c34]">
                            {children}
                          </div>
                        ),
                        code: ({ node, className, children, ...props }: any) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const isInline = !match && !String(children).includes('\n');
                          
                          if (!isInline && match) {
                            const codeString = String(children).replace(/\n$/, '');
                            return (
                              <>
                                <button
                                  onClick={() => handleCopy(codeString, codeString.slice(0, 10))}
                                  className="absolute top-3 right-3 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-300 transition-all opacity-0 group-hover:opacity-100 z-10"
                                  title="复制代码"
                                >
                                  {copiedCode === codeString.slice(0, 10) ? (
                                    <Check size={14} className="text-green-400" />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                                <code className={`${className} block p-4 overflow-x-auto text-sm`} {...props}>
                                  {children}
                                </code>
                              </>
                            );
                          }
                          return (
                            <code className={`${className} bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm`} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {article.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p>暂无正文内容</p>
                )}
              </article>

              {/* Related Posts */}
              <section className="related-section">
                <h3>相关阅读</h3>
                <div className="related-grid">
                  {relatedArticles.length > 0 ? (
                    relatedArticles.map((related: any) => (
                      <Link
                        key={related.articleId}
                        href={`/${locale}/article/${related.articleId}`}
                        className="related-card"
                      >
                        {related.coverImage && (
                          <img
                            src={related.coverImage}
                            alt={related.title}
                            className="related-cover"
                          />
                        )}
                        <div className="related-content">
                          <h4>{related.title}</h4>
                          <span className="date">
                            {related.category?.name || "未分类"} · {formatDate(related.publishedAt)}
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p style={{ color: "var(--text-secondary)" }}>暂无相关推荐</p>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[10001] bg-black/90 flex items-center justify-center cursor-zoom-out"
          onClick={() => setLightboxImg(null)}
        >
          <img src={lightboxImg} className="max-w-[90%] max-h-[90vh] object-contain animate-in fade-in zoom-in duration-300" />
          <button className="absolute top-8 right-8 text-white text-4xl font-bold">&times;</button>
        </div>
      )}
    </div>
  );
}
