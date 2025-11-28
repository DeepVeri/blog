"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Copy, Check } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';

export default function ArticlePage() {
  const [views, setViews] = useState(0);
  const [activeId, setActiveId] = useState<string>('');
  const [toc, setToc] = useState<{id: string, text: string, level: number}[]>([]);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // View Counter Simulation
  useEffect(() => {
    const storedViews = localStorage.getItem('page_views_article_mcp');
    let newViews = storedViews ? parseInt(storedViews) + 1 : Math.floor(Math.random() * (1500 - 800 + 1)) + 800;
    setViews(newViews);
    localStorage.setItem('page_views_article_mcp', newViews.toString());
  }, []);

  // TOC Generation & Scroll Spy
  useEffect(() => {
    const headings = document.querySelectorAll('.article-content h2, .article-content h3');
    const tocData: {id: string, text: string, level: number}[] = [];
    
    headings.forEach((heading) => {
        if (!heading.id) {
            heading.id = heading.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
        }
        tocData.push({
            id: heading.id,
            text: heading.textContent || '',
            level: heading.tagName === 'H2' ? 2 : 3
        });
    });
    setToc(tocData);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setActiveId(entry.target.id);
            }
        });
    }, { rootMargin: '-100px 0px -66%' });

    headings.forEach(h => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  // Copy Code Function
  const handleCopy = (code: string, blockId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(blockId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
                            {toc.map(item => (
                                <li key={item.id} style={{ marginBottom: '10px' }}>
                                    <a 
                                        href={`#${item.id}`}
                                        className={activeId === item.id ? 'active' : ''}
                                        style={{ 
                                            paddingLeft: item.level === 3 ? '20px' : '10px',
                                            fontSize: item.level === 3 ? '13px' : '14px'
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
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
                <header className="article-header">
                    <Link href="/" className="back-link">← 返回文章列表</Link>
                    <h1>如何利用 MCP 协议构建下一代 AI 助手</h1>
                    <div className="article-meta">
                        <span className="post-tag">AI 技术</span>
                        <span>2025-11-26</span>
                        <span>8 分钟阅读</span>
                        <span className="view-count">
                            <Eye size={16} className="opacity-70" />
                            <span>{views} views</span>
                        </span>
                    </div>
                </header>

                <article className="article-content">
                    <p>在人工智能快速发展的今天，大语言模型（LLM）已经展现出了惊人的能力。然而，它们通常被限制在对话框中，无法直接访问我们的本地文件、数据库或内部工具。这就是 Model Context Protocol (MCP) 诞生的背景。</p>
                    
                    <img 
                        src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000" 
                        alt="AI Assistant Concept" 
                        className="zoomable cursor-zoom-in rounded-lg my-10 hover:scale-[1.02] transition-transform"
                        onClick={(e) => setLightboxImg(e.currentTarget.src)}
                    />

                    <h2>什么是 MCP？</h2>
                    <p>MCP 是一个开放标准协议，旨在标准化 AI 模型与外部数据源/工具之间的通信。你可以把它想象成是 AI 时代的 USB 接口。只要你的工具实现了 MCP 协议，任何支持 MCP 的 AI 客户端（如 Claude Desktop, Cursor 等）都可以直接使用它，而无需为每个模型编写特定的适配器。</p>

                    <p>在过去，如果你想让 GPT-4 访问你的 PostgreSQL 数据库，你需要编写复杂的中间层代码。而现在，只需要运行一个 MCP Server，一切就变得简单了。</p>

                    <h2>核心组件</h2>
                    <p>MCP 架构主要包含三个部分：</p>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li><strong>MCP Host</strong>: AI 客户端应用程序（如 IDE、聊天机器人）。</li>
                        <li><strong>MCP Client</strong>: 在 Host 内部运行，负责与 Server 建立连接 (1:1)。</li>
                        <li><strong>MCP Server</strong>: 提供具体的工具（Tools）、资源（Resources）或提示词（Prompts）。</li>
                    </ul>
                    
                    <img 
                        src="https://images.unsplash.com/photo-1558494949-efdeb6bf8d71?auto=format&fit=crop&q=80&w=1000" 
                        alt="System Architecture" 
                        className="zoomable cursor-zoom-in rounded-lg my-10 hover:scale-[1.02] transition-transform"
                        onClick={(e) => setLightboxImg(e.currentTarget.src)}
                    />

                    <h2>实战：构建一个简单的文件读取工具</h2>
                    <p>让我们来看一个简单的 Python 示例，如何创建一个允许 AI 读取本地文件的 MCP Server。</p>

                    <div className="relative group">
                        <button 
                            onClick={() => handleCopy(`from mcp.server import FastMCP

mcp = FastMCP("FileReader")

@mcp.tool()
def read_file(path: str) -> str:
    """读取指定路径的文本文件内容"""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {str(e)}"

if __name__ == "__main__":
    mcp.run()`, 'block1')}
                            className="absolute top-2 right-2 p-1.5 rounded bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
                        >
                            {copiedCode === 'block1' ? <Check size={14} className="text-green-500"/> : <Copy size={14} className="text-gray-500"/>}
                        </button>
                        <pre><code>{`from mcp.server import FastMCP

mcp = FastMCP("FileReader")

@mcp.tool()
def read_file(path: str) -> str:
    """读取指定路径的文本文件内容"""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {str(e)}"

if __name__ == "__main__":
    mcp.run()`}</code></pre>
                    </div>

                    <p>仅仅几行代码，我们就定义了一个名为 <code>read_file</code> 的工具。当你在 Claude Desktop 中配置这个 Server 后，你可以直接对 AI 说：“帮我分析一下 D 盘项目里的 config.json 文件”，AI 就会自动调用这个工具读取内容并进行分析。</p>

                    <h2>未来的可能性</h2>
                    <p>MCP 的出现极大地降低了 AI Agent 的开发门槛。我们可以预见，未来会有越来越多的 SaaS 服务提供 MCP 接口，让 AI 能够像操作浏览器一样操作整个互联网。</p>
                    
                    <p>对于开发者而言，现在正是学习并构建私有 MCP 工具集的最佳时机。无论是自动化运维脚本、内部文档检索，还是代码库分析，MCP 都能让你的 AI 助手变得更加强大和个性化。</p>
                </article>

                {/* Related Posts */}
                <section className="related-section">
                    <h3>相关阅读</h3>
                    <div className="related-grid">
                        <Link href="#" className="related-card">
                            <h4>Prompt Engineering 进阶指南</h4>
                            <span className="date">2025-10-20</span>
                        </Link>
                        <Link href="#" className="related-card">
                            <h4>2025 年前端构建工具链选型指南</h4>
                            <span className="date">2025-11-15</span>
                        </Link>
                        <Link href="#" className="related-card">
                            <h4>如何从零构建一个 RAG 知识库</h4>
                            <span className="date">2025-09-12</span>
                        </Link>
                    </div>
                </section>
            </main>
        </div>

        {/* Lightbox Modal */}
        {lightboxImg && (
            <div 
                className="fixed inset-0 z-[10001] bg-black/90 flex items-center justify-center cursor-zoom-out"
                onClick={() => setLightboxImg(null)}
            >
                <img 
                    src={lightboxImg} 
                    className="max-w-[90%] max-h-[90vh] object-contain animate-in fade-in zoom-in duration-300" 
                />
                <button className="absolute top-8 right-8 text-white text-4xl font-bold">&times;</button>
            </div>
        )}
    </div>
  );
}
