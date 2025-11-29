"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FileText, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import MarkdownEditor from "@/components/MarkdownEditor";
import TagCategorySelector from "@/components/TagCategorySelector";
import { API_BASE } from "@/lib/apiConfig";

type FormData = {
  articleId: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  readTime: string;
  categoryId: string;
  tagIds: string[];
  authorId: string;
};

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params.id as string;

  const [form, setForm] = useState<FormData>({
    articleId: "",
    title: "",
    summary: "",
    content: "",
    status: "draft",
    readTime: "",
    categoryId: "",
    tagIds: [],
    authorId: ""
  });
  const [authors, setAuthors] = useState<{ userId: string; name: string }[]>([]);
  const [loadingAuthors, setLoadingAuthors] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/articles/${uuid}`);
        if (!res.ok) throw new Error(`获取文章失败 ${res.status}`);
        const data = await res.json();
        setForm({
          articleId: data.articleId || "",
          title: data.title || "",
          summary: data.summary || "",
          content: data.content || "",
          status: data.status || "draft",
          readTime: data.readTime || "",
          categoryId: data.category?.categoryId || "",
          tagIds: data.tags?.map((t: any) => t.tagId) || [],
          authorId: data.author?.userId || ""
        });
      } catch (e: any) {
        setError(e.message || "加载失败");
      } finally {
        setLoading(false);
      }
    };
    if (uuid) fetchArticle();
  }, [uuid]);

  useEffect(() => {
    const fetchAuthors = async () => {
      setLoadingAuthors(true);
      try {
        const res = await fetch(`${API_BASE}/api/users`);
        if (!res.ok) throw new Error("加载作者失败");
        const payload = await res.json();
        setAuthors(
          payload.map((user: any) => ({
            userId: user.userId || user.id,
            name: user.name || user.email || user.userId
          }))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAuthors(false);
      }
    };
    fetchAuthors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("标题不能为空");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/articles/${uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(`保存失败 ${res.status}`);
      router.push("/posts");
    } catch (e: any) {
      setError(e.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="text-blue-600" />
            编辑文章
          </h1>
        </div>
      </header>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                文章ID（可读标识）
              </label>
              <input
                type="text"
                value={form.articleId}
                onChange={e => setForm({ ...form, articleId: e.target.value })}
                placeholder="如 my-first-post"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
              <p className="mt-1 text-xs text-slate-500">用于 URL 路径</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">状态</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="archived">已归档</option>
              </select>
            </div>
          </div>
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              作者
            </label>
            <select
              value={form.authorId}
              onChange={e => setForm({ ...form, authorId: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="">请选择作者</option>
              {authors.map(author => (
                <option key={author.userId} value={author.userId}>
                  {author.name}
                </option>
              ))}
            </select>
            {loadingAuthors && <p className="mt-1 text-xs text-slate-500">正在加载作者...</p>}
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="输入文章标题"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">摘要</label>
            <textarea
              rows={2}
              value={form.summary}
              onChange={e => setForm({ ...form, summary: e.target.value })}
              placeholder="简短描述文章内容"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">正文内容</label>
            <MarkdownEditor
              value={form.content}
              onChange={content => setForm({ ...form, content })}
              placeholder="支持 Markdown 格式，使用工具栏快速插入格式..."
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">预计阅读时长</label>
            <input
              type="text"
              value={form.readTime}
              onChange={e => setForm({ ...form, readTime: e.target.value })}
              placeholder="如：5 分钟阅读"
              className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700">
            <TagCategorySelector
              selectedTags={form.tagIds}
              onTagsChange={tagIds => setForm({ ...form, tagIds })}
              selectedCategory={form.categoryId}
              onCategoryChange={categoryId => setForm({ ...form, categoryId })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/posts"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
          >
            <Save className="h-4 w-4" />
            {saving ? "保存中..." : "保存修改"}
          </button>
        </div>
      </form>
    </div>
  );
}
