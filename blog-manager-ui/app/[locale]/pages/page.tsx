"use client";

import { useEffect, useState } from "react";
import { FileCode, RefreshCw, Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/lib/apiConfig";

type PageRecord = {
  id: string;
  pageId: string;
  title: string;
  titleEn: string;
  subtitle: string;
  status: number;
  updateTime: string;
};

export default function PagesManagementPage() {
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PageRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/pages`);
      if (!res.ok) throw new Error(`接口返回 ${res.status}`);
      const data = await res.json();
      setPages(data || []);
    } catch (reason: any) {
      console.error("fetch pages failed", reason);
      setError(reason?.message || "网络异常");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/pages/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("删除失败");
      setDeleteTarget(null);
      fetchPages();
    } catch (err: any) {
      alert(err.message || "删除失败");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("zh-CN");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCode className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              页面管理
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              管理网站静态页面内容，如关于页面、联系页面等
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchPages()}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
          <Link
            href="pages/new"
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            新建页面
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                页面标识
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                标题
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                英文标题
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                更新时间
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  加载中...
                </td>
              </tr>
            ) : pages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  暂无页面
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded">
                      {page.pageId}
                    </code>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {page.title}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {page.titleEn || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {page.status === 1 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-400">
                        <Eye className="w-3 h-3" />
                        已发布
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-400">
                        <EyeOff className="w-3 h-3" />
                        草稿
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(page.updateTime)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`pages/${page.id}/edit`}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900/20"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(page)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                确认删除
              </h3>
              <button
                onClick={() => setDeleteTarget(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              确定要删除页面 <strong>{deleteTarget.title}</strong> 吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
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
