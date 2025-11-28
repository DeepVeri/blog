"use client";

import { useState, useRef } from "react";
import { Bold, Italic, Heading1, Heading2, Link2, Code, List, ListOrdered, Quote, Image, Eye, EyeOff, Maximize2, Minimize2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/atom-one-light.css'; // 切换为 Atom One Light 主题

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function MarkdownEditor({ value, onChange, placeholder }: Props) {
  const [showPreview, setShowPreview] = useState(true); // 默认开启预览，实现左右分栏
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

  const containerClass = fullscreen
    ? "fixed inset-0 z-50 bg-white dark:bg-slate-900 p-4 flex flex-col"
    : "w-full max-w-full rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col";

  return (
    <div className={containerClass}>
      {/* 工具栏 */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 flex-wrap">
        {tools.map((tool: any, index) =>
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
      <div className={`w-full ${fullscreen ? "flex-1 overflow-hidden" : ""} ${showPreview ? "grid grid-cols-2" : "block"}`}>
        <div className={`${showPreview ? "border-r border-slate-200 dark:border-slate-700" : ""} ${fullscreen ? "h-full" : ""} min-w-0`}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || "支持 Markdown 格式，使用工具栏快速插入格式..."}
            className={`w-full h-full px-3 py-2 text-sm font-mono resize-none focus:outline-none dark:bg-slate-900 dark:text-white ${!fullscreen ? "min-h-[500px]" : ""}`}
          />
        </div>

        {/* 预览区域 */}
        {showPreview && (
          <div className={`px-6 py-4 overflow-auto bg-white dark:bg-slate-900 ${fullscreen ? "h-full" : "min-h-[500px] max-h-[600px]"} min-w-0`}>
            <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent prose-code:before:content-none prose-code:after:content-none">
              {value ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeHighlight]}
                  components={{
                    pre: ({ children }) => (
                      <div className="relative my-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-[#fafafa] dark:bg-[#161b22] shadow-sm">
                        {children}
                      </div>
                    ),
                    img: ({ src, alt, ...props }: any) => (
                      <img
                        src={src}
                        alt={alt || '图片'}
                        className="rounded-lg my-4 max-w-full h-auto"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        {...props}
                      />
                    ),
                    code: ({ node, className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match && !String(children).includes('\n');
                      
                      if (!isInline && match) {
                        return (
                          <code className={`${className} block whitespace-pre p-5 overflow-x-auto text-sm font-mono leading-relaxed text-[#383a42] dark:text-[#c9d1d9]`} {...props}>
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className={`${className} bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono`} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {value}
                </ReactMarkdown>
              ) : (
                <p className="text-slate-400 italic">预览区域（输入内容后显示）</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="px-3 py-1.5 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between">
        <span>支持 Markdown (GFM) 语法 · 自动代码高亮</span>
        <span>点击 <Eye className="inline h-3 w-3" /> 预览 · 点击 <Maximize2 className="inline h-3 w-3" /> 全屏编辑</span>
      </div>
    </div>
  );
}
