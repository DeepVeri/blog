"use client";

import { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Trash2, X, Loader2, Save, Search, KeyRound } from 'lucide-react';
import { AdminModal } from "../../components/AdminModal";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

interface Role {
  id: string;
  name: string;
  description: string;
  createTime: string;
}

interface MenuNode {
  id: string;
  menuId: string;
  parentId?: string | null;
  name: string;
  type?: string;
  children?: MenuNode[];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionTargetRole, setPermissionTargetRole] = useState<Role | null>(null);
  const [permissionMenus, setPermissionMenus] = useState<MenuNode[]>([]);
  const [permissionChecked, setPermissionChecked] = useState<Set<string>>(new Set());
  const [isPermissionLoading, setIsPermissionLoading] = useState(false);
  const [isPermissionSaving, setIsPermissionSaving] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState({ type: "", text: "" });
  
  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/roles`);
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Failed to fetch roles', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openCreateModal = () => {
    setCurrentRole(null);
    setName('');
    setDescription('');
    setMessage({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const openPermissionModal = async (role: Role) => {
    setPermissionTargetRole(role);
    setIsPermissionModalOpen(true);
    setPermissionMessage({ type: "", text: "" });
    setIsPermissionLoading(true);

    try {
      const [menusRes, roleMenusRes] = await Promise.all([
        fetch(`${API_BASE}/api/menus`),
        fetch(`${API_BASE}/api/roles/${role.id}/menus`),
      ]);

      if (!menusRes.ok) {
        throw new Error("加载菜单失败");
      }

      const menusData = await menusRes.json();
      setPermissionMenus(menusData);

      if (roleMenusRes.ok) {
        const roleMenuIds: string[] = await roleMenusRes.json();
        setPermissionChecked(new Set(roleMenuIds));
      } else {
        setPermissionChecked(new Set());
      }
    } catch (error: any) {
      console.error("Failed to load permissions:", error);
      setPermissionMessage({ type: "error", text: error.message || "加载权限数据失败" });
    } finally {
      setIsPermissionLoading(false);
    }
  };

  const openEditModal = (role: Role) => {
    setCurrentRole(role);
    setName(role.name);
    setDescription(role.description);
    setMessage({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/roles/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchRoles();
        setMessage({ type: 'success', text: '角色已删除' });
      } else {
        setMessage({ type: 'error', text: '删除失败' });
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      setMessage({ type: 'error', text: '删除失败，请稍后重试' });
    }
  };

  const openDeleteConfirm = (role: Role) => {
    setDeleteTarget(role);
  };

  const togglePermission = (menuId: string) => {
    setPermissionChecked((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  const handleSavePermissions = async () => {
    if (!permissionTargetRole) return;

    setIsPermissionSaving(true);
    setPermissionMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_BASE}/api/roles/${permissionTargetRole.id}/menus`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Array.from(permissionChecked)),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "保存权限失败");
      }

      setIsPermissionModalOpen(false);
      setPermissionTargetRole(null);
      setMessage({ type: "success", text: "权限已更新" });
    } catch (error: any) {
      console.error("Failed to save permissions:", error);
      setPermissionMessage({ type: "error", text: error.message || "保存权限失败" });
    } finally {
      setIsPermissionSaving(false);
    }
  };

  const renderPermissionTree = (menus: MenuNode[], level: number = 0): JSX.Element[] => {
    const elements: JSX.Element[] = [];

    menus.forEach((menu) => {
      const isChecked = permissionChecked.has(menu.menuId);
      elements.push(
        <div
          key={menu.id}
          className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-white/5"
          style={{ paddingLeft: `${level * 16}px` }}
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => togglePermission(menu.menuId)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-800 dark:text-gray-200">{menu.name}</span>
          </label>
          {menu.type && (
            <span className="text-xs text-gray-400 uppercase">{menu.type}</span>
          )}
        </div>
      );

      if (menu.children && menu.children.length > 0) {
        elements.push(...renderPermissionTree(menu.children, level + 1));
      }
    });

    return elements;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    const payload = { name, description };
    const url = currentRole 
      ? `${API_BASE}/api/roles/${currentRole.id}`
      : `${API_BASE}/api/roles`;
    
    const method = currentRole ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '操作失败');
      }

      setIsModalOpen(false);
      fetchRoles();
      setMessage({ type: 'success', text: currentRole ? '角色已更新' : '角色已创建' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="text-blue-600" />
            角色管理
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            管理系统内的角色权限定义
          </p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>新建角色</span>
        </button>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message.text}
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : roles.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            暂无角色数据，请点击上方按钮创建
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">角色名称</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">描述</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">创建时间</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                          {role.name.charAt(0).toUpperCase()}
                        </div>
                        {role.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {role.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(role.createTime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openPermissionModal(role)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="分配权限"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button 
                          onClick={() => openEditModal(role)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => openDeleteConfirm(role)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        title={currentRole ? '编辑角色' : '新建角色'}
        onClose={() => setIsModalOpen(false)}
        footer={(
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
              form="role-form"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              保存
            </button>
          </>
        )}
      >
        <form id="role-form" onSubmit={handleSubmit} className="space-y-4">
          {message.text && (
            <div className={`p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">角色名称</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如: ADMIN"
              className="w-full px-3 py-2 bg-gray-50 dark:bg:white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">建议使用大写字母，如 USER, EDITOR</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述该角色的权限范围..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 dark:bg:white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </form>
      </AdminModal>

      {isPermissionModalOpen && permissionTargetRole && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text:white">
                  分配权限 - {permissionTargetRole.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">勾选该角色可以访问的菜单和按钮</p>
              </div>
              <button
                onClick={() => {
                  setIsPermissionModalOpen(false);
                  setPermissionTargetRole(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {permissionMessage.text && (
                <div className={`p-3 rounded-lg text-sm ${permissionMessage.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                  {permissionMessage.text}
                </div>
              )}

              {isPermissionLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="animate-spin text-gray-400" size={24} />
                </div>
              ) : permissionMenus.length === 0 ? (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  暂无菜单数据，请先在菜单管理中配置菜单。
                </div>
              ) : (
                <div className="border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/60 dark:bg-white/5 p-3 text-sm space-y-1 max-h-[60vh] overflow-y-auto">
                  {renderPermissionTree(permissionMenus)}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/60 dark:bg-black/20">
              <button
                type="button"
                onClick={() => {
                  setIsPermissionModalOpen(false);
                  setPermissionTargetRole(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isPermissionSaving}
                onClick={handleSavePermissions}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isPermissionSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                保存
              </button>
            </div>
          </div>
        </div>
      )}

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
                确定要删除角色
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
