"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Edit, Trash2, X, Loader2, Save } from "lucide-react";
import { AdminModal } from "../../components/AdminModal";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

interface Organization {
  id: string;
  orgId: string;
  parentOrgId?: string | null;
  name: string;
  description?: string | null;
  createTime?: string;
}

interface OrganizationNode extends Organization {
  children?: OrganizationNode[];
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgTree, setOrgTree] = useState<OrganizationNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);

  // form state
  const [name, setName] = useState("");
  const [orgId, setOrgId] = useState("");
  const [parentOrgId, setParentOrgId] = useState<string | "">("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "" | "error" | "success"; text: string }>({ type: "", text: "" });

  const fetchOrganizations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/organizations`);
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data);
        setOrgTree(buildOrgTree(data));
      } else {
        console.error("Failed to fetch organizations");
      }
    } catch (e) {
      console.error("Failed to fetch organizations", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // 将平铺的组织列表构建为树结构
  const buildOrgTree = (items: Organization[]): OrganizationNode[] => {
    const map = new Map<string, OrganizationNode>();
    const roots: OrganizationNode[] = [];

    items.forEach((item) => {
      map.set(item.orgId, { ...item, children: [] });
    });

    map.forEach((node) => {
      if (node.parentOrgId) {
        const parent = map.get(node.parentOrgId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const openCreateModal = () => {
    setCurrentOrg(null);
    setName("");
    setOrgId("");
    setParentOrgId("");
    setDescription("");
    setMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (org: Organization) => {
    setCurrentOrg(org);
    setName(org.name);
    setOrgId(org.orgId);
    setParentOrgId(org.parentOrgId || "");
    setDescription(org.description || "");
    setMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (org: Organization) => {
    setDeleteTarget(org);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/organizations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "删除失败");
      }
      await fetchOrganizations();
      setMessage({ type: "success", text: "删除成功" });
    } catch (e: any) {
      console.error("Delete organization failed", e);
      setMessage({ type: "error", text: e.message || "删除失败，请稍后重试" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    const payload: Partial<Organization> = {
      name,
      description,
      parentOrgId: parentOrgId || null,
    };

    // orgId 只在创建时允许指定/生成，编辑时不修改 orgId
    if (!currentOrg) {
      if (orgId.trim()) {
        payload.orgId = orgId.trim();
      }
    }

    const url = currentOrg
      ? `${API_BASE}/api/organizations/${currentOrg.id}`
      : `${API_BASE}/api/organizations`;

    const method = currentOrg ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "操作失败");
      }

      setIsModalOpen(false);
      await fetchOrganizations();
      setMessage({
        type: "success",
        text: currentOrg ? "组织已更新" : "组织已创建",
      });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "操作失败" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getParentName = (parentId?: string | null) => {
    if (!parentId) return "-";
    const parent = organizations.find((o) => o.orgId === parentId);
    return parent ? parent.name : parentId;
  };

  const renderRows = (nodes: OrganizationNode[], level: number = 0): JSX.Element[] => {
    const rows: JSX.Element[] = [];

    nodes.forEach((org) => {
      rows.push(
        <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
            <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
              {level > 0 && <span className="text-gray-300 mr-2">└</span>}
              <span>{org.name}</span>
            </div>
          </td>
          <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">{org.orgId}</td>
          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{getParentName(org.parentOrgId)}</td>
          <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
            {org.description || "-"}
          </td>
          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
            {org.createTime ? new Date(org.createTime).toLocaleDateString() : "-"}
          </td>
          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(org)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="编辑"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => openDeleteConfirm(org)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="删除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </td>
        </tr>
      );

      if (org.children && org.children.length > 0) {
        rows.push(...renderRows(org.children, level + 1));
      }
    });

    return rows;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="text-blue-600" />
            组织管理
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">管理系统中的组织结构，多层级支持</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>新建组织</span>
        </button>
      </div>

      {message.text && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : organizations.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            暂无组织数据，请点击上方按钮创建
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">组织名称</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">组织ID</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">上级组织</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">描述</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">创建时间</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {renderRows(orgTree)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={currentOrg ? "编辑组织" : "新建组织"}
        onClose={() => setIsModalOpen(false)}
        footer={(
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg:white/5 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              form="org-form"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              保存
            </button>
          </>
        )}
      >
        <form id="org-form" onSubmit={handleSubmit} className="space-y-4">
          {message.text && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">组织名称 *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如: 技术部"
              className="w-full px-3 py-2 bg-gray-50 dark:bg:white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              组织ID
              <span className="text-gray-400 font-normal ml-1">(留空自动生成)</span>
            </label>
            <input
              type="text"
              value={orgId}
              onChange={(e) =>
                setOrgId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              placeholder="例如: tech-dept"
              disabled={!!currentOrg}
              className="w-full px-3 py-2 bg-gray-50 dark:bg:white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">上级组织</label>
            <select
              value={parentOrgId}
              onChange={(e) => setParentOrgId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg:white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">无（顶级组织）</option>
              {organizations
                .filter((o) => !currentOrg || o.id !== currentOrg.id)
                .map((o) => (
                  <option key={o.id} value={o.orgId}>
                    {o.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述该组织的职责、范围..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 dark:bg:white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                确定要删除组织
                <span className="font-semibold">「{deleteTarget.name}」</span>
                吗？此操作不可恢复。
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
