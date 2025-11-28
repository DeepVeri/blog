"use client";

import { MessageSquare } from "lucide-react";

export default function CommentsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <MessageSquare className="text-blue-600" />
        评论管理
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        这里将用于管理评论（审核、删除、屏蔽等）。当前为占位页面，功能可后续逐步接入。
      </p>
    </div>
  );
}
