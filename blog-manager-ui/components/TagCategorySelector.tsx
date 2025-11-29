"use client";

import { useEffect, useState } from "react";
import { X, Check, ChevronDown } from "lucide-react";
import { API_BASE } from "@/lib/apiConfig";

type Tag = { id: string; tagId: string; name: string };
type Category = { id: string; categoryId: string; name: string };

type Props = {
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
};

export default function TagCategorySelector({
  selectedTags,
  onTagsChange,
  selectedCategory,
  onCategoryChange
}: Props) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/tags`)
      .then(res => res.json())
      .then(data => setTags(data.map((t: any) => ({ id: t.id, tagId: t.tagId, name: t.name }))))
      .catch(() => {})
      .finally(() => setLoadingTags(false));

    fetch(`${API_BASE}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data.map((c: any) => ({ id: c.id, categoryId: c.categoryId, name: c.name }))))
      .catch(() => {})
      .finally(() => setLoadingCategories(false));
  }, []);

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(t => t !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  return (
    <div className="space-y-4">
      {/* 分类选择 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          分类
        </label>
        {loadingCategories ? (
          <div className="h-10 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
        ) : (
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={e => onCategoryChange(e.target.value)}
              className="w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="">未分类</option>
              {categories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        )}
        {categories.length === 0 && !loadingCategories && (
          <p className="mt-1 text-xs text-slate-500">暂无分类，请先在"分类管理"中创建</p>
        )}
      </div>

      {/* 标签选择 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          标签（可多选）
        </label>
        {loadingTags ? (
          <div className="h-20 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
        ) : tags.length === 0 ? (
          <p className="text-xs text-slate-500">暂无标签，请先在"标签管理"中创建</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => {
              const isSelected = selectedTags.includes(tag.tagId);
              return (
                <button
                  key={tag.tagId}
                  type="button"
                  onClick={() => toggleTag(tag.tagId)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  {tag.name}
                </button>
              );
            })}
          </div>
        )}

        {/* 已选标签展示 */}
        {selectedTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedTags.map(tagId => {
              const tag = tags.find(t => t.tagId === tagId);
              return tag ? (
                <span
                  key={tagId}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => toggleTag(tagId)}
                    className="hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
