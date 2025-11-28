"use client";

import { useState, useRef } from "react";
import { Bold, Italic, Heading1, Heading2, Link2, Code, List, ListOrdered, Quote, Image, Eye, EyeOff, Maximize2, Minimize2 } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function MarkdownEditor({ value, onChange, placeholder }: Props) {
  const [showPreview, setShowPreview] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);

    // 恢复光标位置
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const tools = [
    { icon: Bold, title: "加粗", action: () => insertText("**", "**", "粗体文字") },
    { icon: Italic, title: "斜体", action: () => insertText("*", "*", "斜体文字") },
    { icon: Heading1, title: "一级标题", action: () => insertText("# ", "", "标题") },
    { icon: Heading2, title: "二级标题", action: () => insertText("## ", "", "标题") },
    { divider: true },
    { icon: Link2, title: "链接", action: () => insertText("[", "](url)", "链接文字") },
    { icon: Image, title: "图片", action: () => insertText("![", "](url)", "图片描述") },
    { icon: Code, title: "代码", action: () => insertText("`", "`", "code") },
    { divider: true },
    { icon: List, title: "无序列表", action: () => insertText("- ", "", "列表项") },
    { icon: ListOrdered, title: "有序列表", action: () => insertText("1. ", "", "列表项") },
    { icon: Quote, title: "引用", action: () => insertText("> ", "", "引用内容") },
  ];

  // 简单的 Markdown 渲染（基础版）
  const renderMarkdown = (text: string) => {
    return text
      // 标题
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      // 粗体和斜体
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // 代码
      .replace(/`(.+?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded text-sm">$1</code>')
      // 链接
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>')
      // 图片
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-2" />')
      // 引用
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-slate-300 pl-4 text-slate-600 italic my-2">$1</blockquote>')
      // 列表
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      // 换行
      .replace(/\n/g, '<br />');
  };

  const containerClass = fullscreen
    ? "fixed inset-0 z-50 bg-white dark:bg-slate-900 p-4 flex flex-col"
    : "rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden";

  return (
    <div className={containerClass}>
      {/* 工具栏 */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 flex-wrap">
        {tools.map((tool, index) =>
          tool.divider ? (
            <div key={index} className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1" />
          ) : (
            <button
              key={index}
              type="button"
              onClick={tool.action}
              title={tool.title}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            >
              {tool.icon && <tool.icon className="h-4 w-4" />}
            </button>
          )
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          title={showPreview ? "隐藏预览" : "显示预览"}
          className={`p-1.5 rounded transition ${showPreview ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
        >
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => setFullscreen(!fullscreen)}
          title={fullscreen ? "退出全屏" : "全屏编辑"}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
        >
          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* 编辑区域 */}
      <div className={`flex ${fullscreen ? "flex-1 overflow-hidden" : ""}`}>
        <div className={`${showPreview ? "w-1/2 border-r border-slate-200 dark:border-slate-700" : "w-full"} ${fullscreen ? "h-full" : ""}`}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || "支持 Markdown 格式，使用工具栏快速插入格式..."}
            className={`w-full px-3 py-2 text-sm font-mono resize-none focus:outline-none dark:bg-slate-900 dark:text-white ${fullscreen ? "h-full" : "min-h-[300px]"}`}
          />
        </div>

        {/* 预览区域 */}
        {showPreview && (
          <div className={`w-1/2 px-4 py-2 overflow-auto bg-white dark:bg-slate-900 ${fullscreen ? "h-full" : "min-h-[300px] max-h-[400px]"}`}>
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
              {value ? (
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
              ) : (
                <p className="text-slate-400 italic">预览区域（输入内容后显示）</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="px-3 py-1.5 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        支持 Markdown 语法 · 点击 <Eye className="inline h-3 w-3" /> 预览 · 点击 <Maximize2 className="inline h-3 w-3" /> 全屏编辑
      </div>
    </div>
  );
}
