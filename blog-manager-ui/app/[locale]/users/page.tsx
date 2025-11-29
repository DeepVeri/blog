"use client";

import { useState, useEffect } from 'react';
import { Edit, Trash2, UserPlus, Search, Loader2, X, Save, Users } from 'lucide-react';
import { AdminModal } from "../../components/AdminModal";
import { API_BASE } from "@/lib/apiConfig";

interface User {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
    description: string;
  };
  status: number;
  lastLoginTime: string;
  avatar?: string;
  organization?: string; // 组织名称（冗余字段，方便展示）
  organizationEntity?: {
    orgId: string;
    name?: string;
  };
}

interface RoleOption {
  id: string;
  name: string;
  description?: string;
}

interface OrganizationOption {
  id: string;
  orgId: string;
  name: string;
  parentOrgId?: string | null;
}

interface OrganizationTreeNode extends OrganizationOption {
  children?: OrganizationTreeNode[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRoleId, setFormRoleId] = useState<string>("");
  const [formOrgId, setFormOrgId] = useState<string>("");
  const [formStatus, setFormStatus] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [isRolesLoading, setIsRolesLoading] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [isOrgsLoading, setIsOrgsLoading] = useState(false);
  const [orgFilter, setOrgFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // 将平铺的组织列表构建为树结构，便于在下拉中树状展示
  const buildOrgTree = (items: OrganizationOption[]): OrganizationTreeNode[] => {
    const map = new Map<string, OrganizationTreeNode>();
    const roots: OrganizationTreeNode[] = [];

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

  const flattenOrgTree = (
    nodes: OrganizationTreeNode[],
    level: number,
    keyword?: string
  ): { org: OrganizationOption; label: string }[] => {
    const result: { org: OrganizationOption; label: string }[] = [];

    nodes.forEach((node) => {
      const baseLabel = node.name;
      const prefix = level > 0 ? `${"".padStart(level * 2, " ")}└ ` : "";
      const label = `${prefix}${baseLabel}`;

      const matchesKeyword = !keyword
        ? true
        : baseLabel.toLowerCase().includes(keyword) ||
          node.orgId.toLowerCase().includes(keyword);

      if (matchesKeyword) {
        result.push({ org: node, label });
      }

      if (node.children && node.children.length > 0) {
        result.push(...flattenOrgTree(node.children, level + 1, keyword));
      }
    });

    return result;
  };

  const filteredOrgOptions = (() => {
    const keyword = orgFilter.trim().toLowerCase() || undefined;
    if (organizations.length === 0) return [] as { org: OrganizationOption; label: string }[];
    const tree = buildOrgTree(organizations);
    return flattenOrgTree(tree, 0, keyword);
  })();

  const fetchUsers = async (keyword?: string) => {
    setIsLoading(true);
    try {
      const url = keyword && keyword.trim()
        ? `${API_BASE}/api/users/search?keyword=${encodeURIComponent(keyword.trim())}`
        : `${API_BASE}/api/users`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('加载用户失败');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setMessage({ type: 'error', text: '加载用户列表失败' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await fetchUsers(searchTerm);
    }
  };

  const fetchRoles = async () => {
    setIsRolesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/roles`);
      if (!res.ok) {
        throw new Error('加载角色失败');
      }
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      setMessage({ type: 'error', text: '加载角色列表失败' });
    } finally {
      setIsRolesLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    setIsOrgsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/organizations`);
      if (!res.ok) {
        throw new Error('加载组织失败');
      }
      const data = await res.json();
      setOrganizations(data);
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
      setMessage({ type: 'error', text: '加载组织列表失败' });
    } finally {
      setIsOrgsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 自动隐藏成功提示，错误提示保留
  useEffect(() => {
    if (message.type === 'success' && message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message.type, message.text]);

  const openCreateModal = async () => {
    setCurrentUser(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRoleId("");
    setFormOrgId("");
    setFormStatus(1);
    setMessage({ type: "", text: "" });
    setIsModalOpen(true);
    if (roles.length === 0) {
      await fetchRoles();
    }
    if (organizations.length === 0) {
      await fetchOrganizations();
    }
  };

  const openEditModal = async (user: User) => {
    setCurrentUser(user);
    setFormName(user.name || "");
    setFormEmail(user.email || "");
    setFormPassword("");
    setFormRoleId(user.role?.id || "");
    setFormOrgId(user.organizationEntity?.orgId || "");
    setFormStatus(user.status ?? 1);
    setMessage({ type: "", text: "" });
    setIsModalOpen(true);
    if (roles.length === 0) {
      await fetchRoles();
    }
    if (organizations.length === 0) {
      await fetchOrganizations();
    }
  };

  const openDeleteConfirm = (user: User) => {
    setDeleteTarget(user);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    const payload: any = {
      name: formName,
      email: formEmail,
      status: formStatus,
    };

    if (formPassword) {
      payload.password = formPassword;
    }

    if (formRoleId) {
      payload.role = { id: formRoleId };
    }

    if (formOrgId) {
      payload.organizationEntity = { orgId: formOrgId };
    }

    const url = currentUser
      ? `${API_BASE}/api/users/${currentUser.id}`
      : `${API_BASE}/api/users`;

    const method = currentUser ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || '操作失败');
      }

      setIsModalOpen(false);
      await fetchUsers();
      setMessage({ type: 'success', text: currentUser ? '用户已更新' : '用户已创建' });
    } catch (error: any) {
      console.error('Failed to submit user:', error);
      setMessage({ type: 'error', text: error.message || '操作失败' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchUsers();
      } else {
        setMessage({ type: 'error', text: '删除用户失败' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({ type: 'error', text: '删除用户失败，请稍后重试' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="text-blue-600" />
            用户管理
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            管理系统中的后台用户及其基础信息
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="搜索用户（昵称 / 邮箱 / 角色）..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <UserPlus size={18} />
            <span className="hidden sm:inline">添加用户</span>
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message.text}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">暂无用户</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">用户信息</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">所属组织</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">角色</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">最后登录</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#1a1a1a]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            (user.name || user.email).charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name || '未设置昵称'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.organization || user.organizationEntity?.name || '未分配组织'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role?.name === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                        {user.role?.name || '无角色'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.status === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                        {user.status === 1 ? '正常' : '禁用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLoginTime ? new Date(user.lastLoginTime).toLocaleString() : '从未登录'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(user)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
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

      <AdminModal
        isOpen={isModalOpen}
        title={currentUser ? '编辑用户' : '添加用户'}
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
              form="user-form"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              保存
            </button>
          </>
        )}
      >
        <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
          {message.type === 'error' && message.text && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-600">
              {message.text}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">邮箱</label>
            <input
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">昵称</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="可选"
              className="w-full px-3 py-2 bg-gray-50 dark:bg:white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              密码{currentUser && '（留空则不修改）'}
            </label>
            <input
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg:white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">角色</label>
              <select
                value={formRoleId}
                onChange={(e) => setFormRoleId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg:white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择角色</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {isRolesLoading && (
                <p className="text-xs text-gray-400">正在加载角色...</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">所属组织</label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="搜索组织名称或ID..."
                  value={orgFilter}
                  onChange={(e) => setOrgFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-50 dark:bg:white/5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                  value={formOrgId}
                  onChange={(e) => setFormOrgId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg:white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-64 overflow-y-auto text-sm"
                >
                  <option value="">未分配组织</option>
                  {filteredOrgOptions.map(({ org, label }) => (
                    <option key={org.id} value={org.orgId}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {isOrgsLoading && (
                <p className="text-xs text-gray-400">正在加载组织...</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formStatus === 1}
                onChange={(e) => setFormStatus(e.target.checked ? 1 : 0)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              启用状态
            </label>
          </div>
        </form>
      </AdminModal>

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
                确定要删除用户
                <span className="font-semibold">「{deleteTarget.name || deleteTarget.email}」</span>
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
