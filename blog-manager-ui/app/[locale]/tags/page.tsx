"use client";

import { useEffect, useState } from "react";
import { Tag as TagIcon, Plus, Pencil, Trash2, X, RefreshCw, Loader2, Save } from "lucide-react";
import { AdminModal } from "../../components/AdminModal";

const API_BASE = "http://localhost:8080";

type TagRecord = {
  id: string;
  tagId: string;
  name: string;
};

export default function TagsPage() {
  const [tags, setTags] = useState<TagRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ tagId: "", name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<TagRecord | null>(null);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/tags`);
      if (!res.ok) throw new Error(`接口返回 ${res.status}`);
      const payload = await res.json();
      setTags(payload.map((tag: any) => ({
        id: tag.id,
        tagId: tag.tagId,
        name: tag.name
      })));
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "加载失败" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // Auto hide success message
  useEffect(() => {
    if (message.type === "success" && message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message.type, message.text]);

  const handleCreate = () => {
    setEditingId(null);
    setForm({ tagId: "", name: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (tag: TagRecord) => {
    setEditingId(tag.id);
    setForm({ tagId: tag.tagId, name: tag.name });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/tags/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`删除失败 ${res.status}`);
      setMessage({ type: "success", text: "标签已删除" });
      fetchTags();
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "删除失败" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setMessage({ type: "error", text: "标签名称不能为空" });
      return;
    }
    setIsSubmitting(true);
    try {
      const url = editingId ? `${API_BASE}/api/tags/${editingId}` : `${API_BASE}/api/tags`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(`保存失败 ${res.status}`);
      setIsModalOpen(false);
      setMessage({ type: "success", text: editingId ? "标签已更新" : "标签已创建" });
      fetchTags();
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "保存失败" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TagIcon className="text-blue-600" />
            标签管理
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            管理文章标签，支持多个标签关联同一篇文章
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchTags}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            刷新
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            新增标签
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-3 rounded-lg text-sm ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
          {message.text}
        </div>
      )}

      {/* Tags Grid */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : tags.length === 0 ? (
          <div className="p-12 text-center text-gray-500">暂无标签，点击上方"新增标签"开始创建</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {tags.map(tag => (
              <div
                key={tag.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{tag.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{tag.tagId}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(tag)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(tag)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        title={editingId ? "编辑标签" : "新增标签"}
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              form="tag-form"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              保存
            </button>
          </>
        }
      >
        <form id="tag-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">标签ID（可选）</label>
            <input
              type="text"
              value={form.tagId}
              onChange={e => setForm({ ...form, tagId: e.target.value })}
              placeholder="如 ai-tech（留空自动生成）"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">标签名称 *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="如 AI 技术"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">确认删除</h3>
              <button onClick={() => setDeleteTarget(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                确定要删除标签 <span className="font-semibold">「{deleteTarget.name}」</span> 吗？此操作不可恢复。
              </p>
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (deleteTarget) {
                      await handleDelete(deleteTarget.id);
                    }
                    setDeleteTarget(null);
                  }}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
