'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, Edit, Trash2, Shield, User as UserIcon, Search } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  username: string;
  email?: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  language: string;
  createdAt: string;
  lastLoginAt?: string;
  _count: { favorites: number; readingHistory: number };
}

function UsersManagement() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [newUser, setNewUser] = useState({ username: '', password: '', email: '', role: 'USER' as 'ADMIN' | 'USER', language: 'DE' as 'DE' | 'EN' | 'FA' });

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const data = await api.get<AdminUser[]>('/api/users');
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/api/users', newUser);
      toast.success('User created');
      setShowCreate(false);
      setNewUser({ username: '', password: '', email: '', role: 'USER', language: 'DE' });
      loadUsers();
    } catch (error: any) { toast.error(error.message); }
  }

  async function deleteUser(id: string) {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      toast.success('User deleted');
      loadUsers();
    } catch { toast.error('Failed to delete user'); }
  }

  async function toggleActive(user: AdminUser) {
    try {
      await api.patch(`/api/users/${user.id}`, { isActive: !user.isActive });
      toast.success('User updated');
      loadUsers();
    } catch { toast.error('Failed to update user'); }
  }

  const filtered = users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t('admin.users')}</h1>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-xl bg-accent text-background font-medium flex items-center gap-2 hover:bg-accent-light">
          <UserPlus size={18} />{t('admin.createUser')}
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent" />
        </div>
      </div>

      <div className="glass rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">User</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Role</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Created</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><UserIcon size={20} className="text-accent" /></div>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      {user.email && <p className="text-sm text-gray-500">{user.email}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${user.role === 'ADMIN' ? 'bg-accent/20 text-accent' : 'bg-surface text-gray-400'}`}>
                    <Shield size={12} />{user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => toggleActive(user)} className="p-2 rounded-lg hover:bg-surface text-gray-400 hover:text-white"><Edit size={16} /></button>
                    <button onClick={() => deleteUser(user.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowCreate(false)}>
          <div onClick={(e) => e.stopPropagation()} className="glass rounded-2xl border border-border p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">{t('admin.createUser')}</h2>
            <form onSubmit={createUser} className="space-y-4">
              <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent" required />
              <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent" required />
              <input type="email" placeholder="Email (optional)" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent" />
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'ADMIN' | 'USER' })} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent">
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <select value={newUser.language} onChange={(e) => setNewUser({ ...newUser, language: e.target.value as 'DE' | 'EN' | 'FA' })} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent">
                <option value="DE">Deutsch</option>
                <option value="EN">English</option>
                <option value="FA">فارسی</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl bg-surface border border-border hover:border-accent">{t('common.cancel')}</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-accent text-background font-medium hover:bg-accent-light">{t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AuthGuard requireAdmin>
      <UsersManagement />
    </AuthGuard>
  );
}
