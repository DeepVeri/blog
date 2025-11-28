"use client";

import React from "react";
import { X } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
}

export function AdminModal({
  isOpen,
  title,
  onClose,
  children,
  footer,
  widthClass = "max-w-md",
}: AdminModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`bg-white dark:bg-[#1a1a1a] w-full ${widthClass} rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200`}
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>

        <div className="px-6 pb-6 pt-2 flex justify-end gap-3">
          {footer}
        </div>
      </div>
    </div>
  );
}
