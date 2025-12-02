"use client";

import { useEffect, useState } from 'react';
import { API_BASE } from '@/lib/apiConfig';
import { Github, Mail, Globe, Heart } from 'lucide-react';

interface AboutContent {
  title: string;
  subtitle: string;
  content: string;
  email: string;
  github: string;
  website: string;
}

// 默认内容（后端没有数据时使用）
const defaultContent: AboutContent = {
  title: '关于 DeepVeir',
  subtitle: '探索、构建与思考',
  content: `
## 👋 你好！

欢迎来到 **DeepVeir Blog**，这是一个专注于技术分享与深度思考的个人博客。

### 🎯 博客定位

这里主要分享以下内容：

- **技术架构**：系统设计、微服务、云原生等
- **AI 应用**：大模型、机器学习、智能应用开发
- **前端开发**：React、Next.js、TypeScript 等现代前端技术
- **产品设计**：用户体验、产品思维、设计系统

### 💡 为什么叫 DeepVeir？

**Deep** 代表深度思考，**Veir** 是一个自造词，寓意探索与发现。我们相信，真正的技术成长来自于深入理解原理，而非浅尝辄止。

### 🛠️ 技术栈

本博客使用以下技术构建：

- **前端**：Next.js 14 + TypeScript + Tailwind CSS
- **后端**：Spring Boot 3 + MySQL + JWT
- **部署**：Docker + Nginx

### 📬 联系我

如果你有任何问题或建议，欢迎通过以下方式联系我：
  `,
  email: 'contact@deepveir.com',
  github: 'https://github.com/DeepVeir',
  website: 'https://www.deepveir.com'
};

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/pages/about`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.content) {
            setContent({
              title: data.title || defaultContent.title,
              subtitle: data.subtitle || defaultContent.subtitle,
              content: data.content || defaultContent.content,
              email: data.email || defaultContent.email,
              github: data.github || defaultContent.github,
              website: data.website || defaultContent.website,
            });
          }
        }
      } catch (error) {
        console.log('Using default about content');
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  // 简单的 Markdown 渲染
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        // 标题
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-bold mt-8 mb-4">{line.slice(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold mt-10 mb-4">{line.slice(3)}</h2>;
        }
        // 列表
        if (line.startsWith('- ')) {
          const content = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return <li key={index} className="ml-6 mb-2" dangerouslySetInnerHTML={{ __html: content }} />;
        }
        // 普通段落
        if (line.trim()) {
          const content = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />;
        }
        return null;
      });
  };

  if (loading) {
    return (
      <div className="wrapper">
        <div className="text-center py-20">
          <p style={{ color: 'var(--text-secondary)' }}>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <section className="hero" style={{ paddingBottom: '40px' }}>
        <h1>{content.title}</h1>
        <p className="subtitle">{content.subtitle}</p>
      </section>

      <article className="about-content">
        <div className="prose">
          {renderMarkdown(content.content)}
        </div>

        {/* 联系方式 */}
        <div className="contact-links">
          {content.email && (
            <a href={`mailto:${content.email}`} className="contact-link">
              <Mail size={20} />
              <span>{content.email}</span>
            </a>
          )}
          {content.github && (
            <a href={content.github} target="_blank" rel="noopener noreferrer" className="contact-link">
              <Github size={20} />
              <span>GitHub</span>
            </a>
          )}
          {content.website && (
            <a href={content.website} target="_blank" rel="noopener noreferrer" className="contact-link">
              <Globe size={20} />
              <span>Website</span>
            </a>
          )}
        </div>

        {/* 底部 */}
        <div className="about-footer">
          <p>
            Made with <Heart size={16} className="inline text-red-500" /> by DeepVeir
          </p>
        </div>
      </article>
    </div>
  );
}
