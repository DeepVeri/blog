"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FileCode, Save, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/lib/apiConfig";

interface PageData {
  id: string;
  pageId: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  content: string;
  contentEn: string;
  email: string;
  github: string;
  website: string;
  status: number;
}

export default function EditPagePage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"zh" | "en">("zh");

  const [formData, setFormData] = useState<PageData>({
    id: "",
    pageId: "",
    title: "",
    titleEn: "",
    subtitle: "",
    subtitleEn: "",
    content: "",
    contentEn: "",
    email: "",
    github: "",
    website: "",
    status: 1,
  });

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/pages/id/${pageId}`);
        if (!res.ok) throw new Error("页面不存在");
        const data = await res.json();
        setFormData({
          id: data.id,
          pageId: data.pageId || "",
          title: data.title || "",
          titleEn: data.titleEn || "",
          subtitle: data.subtitle || "",
          subtitleEn: data.subtitleEn || "",
          content: data.content || "",
          contentEn: data.contentEn || "",
          email: data.email || "",
          github: data.github || "",
          website: data.website || "",
          status: data.status ?? 1,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [pageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("保存失败");
      router.push("../pages");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="../pages"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <FileCode className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              编辑页面
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              页面标识: {formData.pageId}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            基本信息
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                页面标识
              </label>
              <input
                type="text"
                value={formData.pageId}
                disabled
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                状态
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === 1}
                    onChange={() => setFormData({ ...formData, status: 1 })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Eye className="w-4 h-4 text-green-600" />
                  <span className="text-sm">发布</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === 0}
                    onChange={() => setFormData({ ...formData, status: 0 })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <EyeOff className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">草稿</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            联系信息
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                邮箱
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GitHub
              </label>
              <input
                type="url"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                网站
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tab Header */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setActiveTab("zh")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "zh"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              🇨🇳 中文内容
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("en")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "en"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              🇺🇸 English Content
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 space-y-4">
            {activeTab === "zh" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    标题
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="页面标题"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    副标题
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="页面副标题"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    内容 (Markdown)
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={15}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                    placeholder="支持 Markdown 格式..."
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Page Title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subtitle (English)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitleEn}
                    onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Page Subtitle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content (Markdown)
                  </label>
                  <textarea
                    value={formData.contentEn}
                    onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                    rows={15}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                    placeholder="Supports Markdown format..."
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href="../pages"
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
