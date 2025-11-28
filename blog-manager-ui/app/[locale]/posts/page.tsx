"use client";

import { useEffect, useState } from "react";
import { FileText, RefreshCw, Plus, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";

const API_BASE = "http://localhost:8080";

type ArticleRecord = {
  id: string;
  uuid: string;
  title: string;
  status: string;
  authorName: string;
  publishedAt?: string | null;
  tags: { name: string }[];
};

export default function PostsPage() {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArticleRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchArticles = async (page = currentPage, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/articles?page=${page - 1}&size=${size}`);
      if (!res.ok) throw new Error(`接口返回 ${res.status}`);
      const payload = await res.json();
      setArticles(
        (payload.content || []).map((article: any) => ({
          id: article.articleId || article.id,
          uuid: article.id,
          title: article.title,
          status: article.status || "draft",
          authorName: article.author?.name || article.author?.userId || "-",
          publishedAt: article.publishedAt,
          tags: Array.isArray(article.tags) ? article.tags : []
        }))
      );
      setTotalPages(payload.totalPages || 1);
      setTotalElements(payload.totalElements || payload.total || 0);
      setCurrentPage((payload.number || 0) + 1);
    } catch (reason: any) {
      console.error("fetch articles failed", reason);
      setError(reason?.message || "网络异常");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(currentPage, pageSize);
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchArticles(1, pageSize);
  }, [pageSize]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/articles/${deleteTarget.uuid}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`删除失败 ${res.status}`);
      setDeleteTarget(null);
      fetchArticles();
    } catch (e: any) {
      setError(e.message || "删除失败");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="text-blue-600" />
            文章管理
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            管理博客文章：新增、编辑、删除、查看列表。
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/posts/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            新增文章
          </Link>
          <button
            onClick={() => fetchArticles(currentPage, pageSize)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            刷新
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          获取文章失败：{error}
        </div>
      )}

      <div className="rounded border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid grid-cols-7 gap-4 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <div className="col-span-2">标题</div>
          <div>状态</div>
          <div>作者</div>
          <div>标签</div>
          <div>发布时间</div>
          <div>操作</div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse bg-slate-50 px-4" />
              ))
            : articles.length === 0
            ? (
                <div className="px-4 py-6 text-sm text-slate-500">暂无文章，点击上方"新增文章"开始创建。</div>
              )
            : articles.map(article => (
                <div key={article.uuid} className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                  <div className="grid grid-cols-7 gap-4 items-center">
                    <div className="col-span-2 font-medium truncate">{article.title}</div>
                    <div>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          article.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : article.status === "archived"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {article.status === "published" ? "已发布" : article.status === "archived" ? "已归档" : "草稿"}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {article.authorName}
                    </div>
                    <div>
                      {article.tags.length > 0 ? (
                        article.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag.name}
                            className="mr-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-white"
                          >
                            {tag.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">未分类</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "-"}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/posts/${article.uuid}/edit`}
                        className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                        title="编辑"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(article)}
                        className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {totalElements > 0 && (
        <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 md:flex-row md:items-center md:justify-between">
          <div>
            第 {currentPage} / {totalPages} 页 · 共 {totalElements} 篇
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-xs">
              <span>每页</span>
              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                className="rounded-md border border-slate-200 bg-transparent px-2 py-1 text-xs dark:border-slate-700"
              >
                {[5, 10, 20, 50].map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>篇</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="rounded-md border border-slate-200 px-2 py-1 text-sm disabled:opacity-50 dark:border-slate-700"
              >
                «
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-slate-200 px-3 py-1 text-sm disabled:opacity-50 dark:border-slate-700"
              >
                上一页
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-slate-200 px-3 py-1 text-sm disabled:opacity-50 dark:border-slate-700"
              >
                下一页
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="rounded-md border border-slate-200 px-2 py-1 text-sm disabled:opacity-50 dark:border-slate-700"
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">确认删除</h3>
              <button onClick={() => setDeleteTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              确定要删除文章「{deleteTarget.title}」吗？此操作不可恢复。
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                取消
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70"
              >
                {deleting ? "删除中..." : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
