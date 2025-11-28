"use client";

import React, { useState, useEffect } from 'react';
import { List, Plus, Edit, Trash2, X, Loader2, Save, ChevronRight, ChevronDown, Folder, FileText, MousePointerClick, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { AdminModal } from "../../components/AdminModal";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

interface Menu {
  id: string;
  menuId: string;
  parentId: string | null;
  name: string;
  path: string;
  icon: string;
  sortOrder: number;
  type: string; // "DIRECTORY", "MENU", "BUTTON"
  permission: string;
  visible: boolean;
  status: number;
  children: Menu[];
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [flatMenus, setFlatMenus] = useState<Menu[]>([]); // 用于父级选择
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    menuId: '',
    name: '',
    path: '',
    icon: '',
    sortOrder: 0,
    type: 'MENU',
    permission: '',
    visible: true,
    status: 1,
    parentId: '' as string,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchMenus = async () => {
    try {
      const [treeRes, listRes] = await Promise.all([
        fetch(`${API_BASE}/api/menus`),
        fetch(`${API_BASE}/api/menus/list`)
      ]);
      if (treeRes.ok) {
        const data = await treeRes.json();
        setMenus(data);
        // 默认展开所有菜单
        const allIds = new Set<string>();
        const collectIds = (items: Menu[]) => {
          items.forEach(item => {
            if (item.children && item.children.length > 0) {
              allIds.add(item.id);
              collectIds(item.children);
            }
          });
        };
        collectIds(data);
        setExpandedMenus(allIds);
      }
      if (listRes.ok) {
        const data = await listRes.json();
        setFlatMenus(data);
      }
    } catch (error) {
      console.error('Failed to fetch menus', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedMenus(newExpanded);
  };

  const openCreateModal = (parentId: string | null = null) => {
    setCurrentMenu(null);
    // 计算下一个排序号
    const maxSort = flatMenus.reduce((max, m) => Math.max(max, m.sortOrder || 0), 0);
    setFormData({
      menuId: '',
      name: '',
      path: '',
      icon: '',
      sortOrder: maxSort + 1,
      type: 'MENU',
      permission: '',
      visible: true,
      status: 1,
      parentId: parentId || '',
    });
    setMessage({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (menu: Menu) => {
    setCurrentMenu(menu);
    setFormData({
      menuId: menu.menuId || '',
      name: menu.name,
      path: menu.path || '',
      icon: menu.icon || '',
      sortOrder: menu.sortOrder || 0,
      type: menu.type,
      permission: menu.permission || '',
      visible: menu.visible,
      status: menu.status,
      parentId: menu.parentId || '',
    });
    setMessage({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/menus/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchMenus();
        setMessage({ type: 'success', text: '菜单已删除' });
      } else {
        setMessage({ type: 'error', text: '删除失败' });
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      setMessage({ type: 'error', text: '删除失败，请稍后重试' });
    }
  };

  const openDeleteConfirm = (menu: Menu) => {
    setDeleteTarget(menu);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    const url = currentMenu 
      ? `${API_BASE}/api/menus/${currentMenu.id}`
      : `${API_BASE}/api/menus`;
    
    const method = currentMenu ? 'PUT' : 'POST';

    // 处理 parentId，空字符串转为 null
    const submitData = {
      ...formData,
      parentId: formData.parentId || null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '操作失败');
      }

      setIsModalOpen(false);
      fetchMenus();
      setMessage({ type: 'success', text: currentMenu ? '菜单已更新' : '菜单已创建' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 移动排序
  const handleMoveUp = async (menu: Menu, siblings: Menu[]) => {
    const index = siblings.findIndex(m => m.id === menu.id);
    if (index <= 0) return;
    
    const prev = siblings[index - 1];
    const updates = [
      { id: menu.id, sortOrder: prev.sortOrder, parentId: menu.parentId },
      { id: prev.id, sortOrder: menu.sortOrder, parentId: prev.parentId },
    ];
    
    try {
      await fetch(`${API_BASE}/api/menus/sort`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      fetchMenus();
    } catch (error) {
      console.error('Failed to update sort', error);
    }
  };

  const handleMoveDown = async (menu: Menu, siblings: Menu[]) => {
    const index = siblings.findIndex(m => m.id === menu.id);
    if (index >= siblings.length - 1) return;
    
    const next = siblings[index + 1];
    const updates = [
      { id: menu.id, sortOrder: next.sortOrder, parentId: menu.parentId },
      { id: next.id, sortOrder: menu.sortOrder, parentId: next.parentId },
    ];
    
    try {
      await fetch('http://localhost:8080/api/menus/sort', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      fetchMenus();
    } catch (error) {
      console.error('Failed to update sort', error);
    }
  };

  // 获取可选的父级菜单（排除自己和自己的子菜单）
  const getAvailableParents = (currentId?: string) => {
    if (!currentId) return flatMenus.filter(m => m.type === 'DIRECTORY' || m.type === 'MENU');
    
    // 收集当前菜单及其所有子菜单的ID
    const excludeIds = new Set<string>();
    const collectChildIds = (menuId: string) => {
      excludeIds.add(menuId);
      flatMenus.filter(m => m.parentId === menuId).forEach(child => {
        collectChildIds(child.menuId);
      });
    };
    
    const currentMenu = flatMenus.find(m => m.id === currentId);
    if (currentMenu) {
      collectChildIds(currentMenu.menuId);
    }
    
    return flatMenus.filter(m => 
      (m.type === 'DIRECTORY' || m.type === 'MENU') && 
      !excludeIds.has(m.menuId)
    );
  };

  // Recursive rendering of rows
  const renderRows = (menuList: Menu[], level: number = 0, parentSiblings?: Menu[]): React.ReactNode => {
    return menuList.map((menu, index) => {
      const siblings = parentSiblings || menuList;
      return (
        <React.Fragment key={menu.id}>
          <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
              <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
                {menu.children && menu.children.length > 0 ? (
                  <button onClick={() => toggleExpand(menu.id)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                    {expandedMenus.has(menu.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                ) : (
                  <span className="w-6" />
                )}
                <span className="text-gray-400">
                  {menu.type === 'DIRECTORY' && <Folder size={16} />}
                  {menu.type === 'MENU' && <FileText size={16} />}
                  {menu.type === 'BUTTON' && <MousePointerClick size={16} />}
                </span>
                {menu.name}
              </div>
            </td>
            <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
              {menu.menuId || '-'}
            </td>
            <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
              {menu.path || '-'}
            </td>
            <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-center">
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => handleMoveUp(menu, siblings)}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="上移"
                >
                  <ArrowUp size={14} />
                </button>
                <span className="w-6 text-center">{menu.sortOrder}</span>
                <button
                  onClick={() => handleMoveDown(menu, siblings)}
                  disabled={index === siblings.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="下移"
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            </td>
            <td className="px-6 py-4 text-center">
              <span className={`px-2 py-0.5 text-xs rounded-full ${menu.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {menu.visible ? '显示' : '隐藏'}
              </span>
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <button 
                  onClick={() => openCreateModal(menu.menuId)}
                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  title="添加子菜单"
                >
                  <Plus size={16} />
                </button>
                <button 
                  onClick={() => openEditModal(menu)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => openDeleteConfirm(menu)}
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
          {expandedMenus.has(menu.id) && menu.children && renderRows(menu.children, level + 1, menu.children)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <List className="text-blue-600" />
            菜单管理
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            配置系统菜单、路由和按钮权限
          </p>
        </div>
        
        <button
          onClick={() => openCreateModal(null)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>新建菜单</span>
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
        ) : menus.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            暂无菜单数据，请点击上方按钮创建
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">名称</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">菜单ID</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">路由路径</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-center">排序</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-center">可见</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {renderRows(menus)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#1a1a1a] z-10">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {currentMenu ? '编辑菜单' : '新建菜单'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {message.text && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">菜单类型</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DIRECTORY">目录</option>
                    <option value="MENU">菜单</option>
                    <option value="BUTTON">按钮</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">父级菜单</label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">无（顶级菜单）</option>
                    {getAvailableParents(currentMenu?.id).map(m => (
                      <option key={m.id} value={m.menuId}>
                        {m.parentId ? '└─ ' : ''}{m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">菜单名称 *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="例如: 用户管理"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    菜单ID
                    <span className="text-gray-400 font-normal ml-1">(留空自动生成)</span>
                  </label>
                  <input 
                    type="text"
                    value={formData.menuId}
                    onChange={(e) => setFormData({...formData, menuId: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                    placeholder="例如: org-mgr"
                    disabled={!!currentMenu}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">排序</label>
                  <input 
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {formData.type !== 'BUTTON' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">路由路径</label>
                    <input 
                      type="text" 
                      value={formData.path}
                      onChange={(e) => setFormData({...formData, path: e.target.value})}
                      placeholder="例如: /users"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {formData.type !== 'BUTTON' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">图标</label>
                  <input 
                    type="text" 
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    placeholder="例如: Users, Settings, Menu"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">权限标识</label>
                <input 
                  type="text" 
                  value={formData.permission}
                  onChange={(e) => setFormData({...formData, permission: e.target.value})}
                  placeholder="例如: sys:user:list"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.visible}
                    onChange={(e) => setFormData({...formData, visible: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">显示在侧边栏</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.status === 1}
                    onChange={(e) => setFormData({...formData, status: e.target.checked ? 1 : 0})}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">启用状态</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  保存
                </button>
              </div>
            </form>
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
                确定要删除菜单
                <span className="font-semibold">「{deleteTarget.name}」</span>
                吗？其子菜单也会被一并删除。
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
