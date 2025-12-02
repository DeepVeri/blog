"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/apiConfig';
import { Folder } from 'lucide-react';

interface Category {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  articleCount?: number;
}

export default function CategoriesPage({ params }: { params: { locale: string } }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const locale = params.locale || 'zh';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="wrapper">
      <section className="hero" style={{ paddingBottom: '40px' }}>
        <h1>文章分类</h1>
        <p className="subtitle">
          按主题浏览所有文章
        </p>
      </section>

      <section className="categories-grid">
        {loading ? (
          <div className="text-center" style={{ gridColumn: '1 / -1', padding: '60px 0' }}>
            <p style={{ color: 'var(--text-secondary)' }}>加载中...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center" style={{ gridColumn: '1 / -1', padding: '60px 0' }}>
            <p style={{ color: 'var(--text-secondary)' }}>暂无分类</p>
          </div>
        ) : (
          categories.map(category => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => router.push(`/${locale}/categories/${category.categoryId}`)}
            >
              <div className="category-icon">
                <Folder size={32} />
              </div>
              <h3>{category.name}</h3>
              <p>{category.description || '暂无描述'}</p>
              {category.articleCount !== undefined && (
                <span className="article-count">{category.articleCount} 篇文章</span>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
