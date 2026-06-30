import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';
import { getUsersDb, updateUserRoleDb, deleteUserDb, createAdminUserDb } from '../firebase/database';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { FaUserShield, FaUserCog, FaMotorcycle, FaUserAlt, FaSearch, FaPlus, FaTrash, FaExchangeAlt, FaCrown } from 'react-icons/fa';

const ROLE_CONFIG = {
  super_admin: { label: 'Super Admin', icon: FaCrown, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  admin: { label: 'Admin', icon: FaUserShield, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  rider: { label: 'Rider', icon: FaMotorcycle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  customer: { label: 'Customer', icon: FaUserAlt, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
};

export const UserManagement = () => {
  const { currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Create admin form
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', fullName: '', phone: '', role: 'admin' });

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const users = await getUsersDb();
      setAllUsers(users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = !search || 
      (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').includes(search);
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (uid, newRole) => {
    setActionLoading(true);
    try {
      await updateUserRoleDb(uid, newRole);
      setSuccessMsg(`Role updated to ${newRole}`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setShowRoleModal(null);
      await fetchAllUsers();
    } catch (err) {
      alert('Failed to update role: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (uid) => {
    setActionLoading(true);
    try {
      await deleteUserDb(uid);
      setSuccessMsg('User deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
      setShowDeleteModal(null);
      await fetchAllUsers();
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.email || !newAdmin.password || !newAdmin.fullName) {
      alert('Please fill all required fields.');
      return;
    }
    setActionLoading(true);
    try {
      await createAdminUserDb(newAdmin);
      const roleLabel = newAdmin.role === 'rider' ? 'Rider' : 'Admin';
      setSuccessMsg(`${roleLabel} account created successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setShowCreateModal(false);
      setNewAdmin({ email: '', password: '', fullName: '', phone: '', role: 'admin' });
      await fetchAllUsers();
    } catch (err) {
      alert('Failed to create user: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const roleCounts = {
    all: allUsers.length,
    super_admin: allUsers.filter(u => u.role === 'super_admin').length,
    admin: allUsers.filter(u => u.role === 'admin').length,
    rider: allUsers.filter(u => u.role === 'rider').length,
    customer: allUsers.filter(u => u.role === 'customer').length,
  };

  return (
    <div className="flex-1 bg-neutral-light px-4 py-5 flex flex-col gap-4 pb-20 text-left">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-neutral-dark flex items-center gap-2">
            <FaUserCog className="text-primary" /> User Management
          </h2>
          <p className="text-[10px] text-neutral-dark/50 font-semibold mt-0.5">
            Manage all users, roles & permissions • {allUsers.length} total users
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center text-sm shadow-md shadow-primary/20 active:scale-95 transition-transform"
        >
          <FaPlus />
        </button>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-2.5 rounded-xl animate-pulse">
          ✅ {successMsg}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark/30 text-xs" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-border rounded-xl text-xs font-semibold outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Role filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
        {[
          { key: 'all', label: 'All' },
          { key: 'super_admin', label: '👑 Super' },
          { key: 'admin', label: '🛡️ Admin' },
          { key: 'rider', label: '🛵 Rider' },
          { key: 'customer', label: '👤 Customer' }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilterRole(f.key)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap border transition-all ${
              filterRole === f.key
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-neutral-dark/60 border-neutral-border hover:border-primary/30'
            }`}
          >
            {f.label} ({roleCounts[f.key]})
          </button>
        ))}
      </div>

      {/* User list */}
      {loading ? (
        <Loader />
      ) : filteredUsers.length === 0 ? (
        <div className="p-8 bg-white border border-neutral-border rounded-3xl text-center text-xs font-semibold text-neutral-dark/40">
          No users found.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredUsers.map((user) => {
            const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.customer;
            const RoleIcon = roleConf.icon;
            const isSelf = currentUser?.uid === user.uid;
            const isSuperAdmin = user.role === 'super_admin';

            return (
              <div key={user.uid} className="bg-white p-3.5 rounded-2xl border border-neutral-border flex items-center gap-3 shadow-xs">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full ${roleConf.bg} ${roleConf.color} flex items-center justify-center text-sm font-bold border ${roleConf.border}`}>
                  <RoleIcon />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-neutral-dark truncate">{user.fullName || 'Unnamed'}</h4>
                    {isSelf && <span className="text-[8px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-bold">YOU</span>}
                  </div>
                  <p className="text-[10px] text-neutral-dark/50 font-semibold mt-0.5 truncate">{user.email}</p>
                  <p className="text-[9px] text-neutral-dark/40 font-semibold">{user.phone || 'No phone'}</p>
                </div>

                {/* Role badge */}
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${roleConf.bg} ${roleConf.color} border ${roleConf.border} uppercase`}>
                    {roleConf.label}
                  </span>
                  
                  {/* Actions (can't modify self) */}
                  {!isSelf && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setShowRoleModal(user)}
                        className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-[10px] hover:bg-blue-100 active:scale-90 transition-all"
                        title="Change Role"
                      >
                        <FaExchangeAlt />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(user)}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-500 border border-red-200 flex items-center justify-center text-[10px] hover:bg-red-100 active:scale-90 transition-all"
                        title="Delete User"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateModal && (
        <Modal isOpen={true} onClose={() => setShowCreateModal(false)} title="Create New Account">
          <form onSubmit={handleCreateAdmin} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-bold text-neutral-dark opacity-80 uppercase tracking-wider">Role *</label>
              <select
                value={newAdmin.role}
                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-border bg-neutral-light transition-all outline-none focus:border-primary focus:bg-white text-xs font-semibold"
              >
                <option value="admin">Admin 🛡️</option>
                <option value="rider">Rider 🛵</option>
              </select>
            </div>
            <Input
              label="Full Name *"
              value={newAdmin.fullName}
              onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
              placeholder={newAdmin.role === 'rider' ? 'Rider Full Name' : 'Admin Full Name'}
            />
            <Input
              label="Email *"
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              placeholder="user@example.com"
            />
            <Input
              label="Password *"
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              placeholder="Min 6 characters"
            />
            <Input
              label="Phone"
              value={newAdmin.phone}
              onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
              placeholder="Mobile number"
            />
            <Button type="submit" disabled={actionLoading} className="w-full mt-1">
              {actionLoading ? 'Creating...' : `Create ${newAdmin.role === 'rider' ? 'Rider' : 'Admin'} Account`}
            </Button>
          </form>
        </Modal>
      )}

      {/* Change Role Modal */}
      {showRoleModal && (
        <Modal isOpen={true} onClose={() => setShowRoleModal(null)} title={`Change Role: ${showRoleModal.fullName}`}>
          <p className="text-xs text-neutral-dark/60 font-semibold mb-3">
            Current role: <span className="font-bold text-neutral-dark">{showRoleModal.role}</span>
          </p>
          <div className="flex flex-col gap-2">
            {['customer', 'rider', 'admin'].filter(r => r !== showRoleModal.role).map(role => {
              const conf = ROLE_CONFIG[role];
              const Icon = conf.icon;
              return (
                <button
                  key={role}
                  onClick={() => handleRoleChange(showRoleModal.uid, role)}
                  disabled={actionLoading}
                  className={`w-full p-3 rounded-xl border ${conf.border} ${conf.bg} flex items-center gap-3 text-xs font-bold ${conf.color} hover:opacity-80 active:scale-[0.98] transition-all`}
                >
                  <Icon className="text-sm" />
                  Promote to {conf.label}
                </button>
              );
            })}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal isOpen={true} onClose={() => setShowDeleteModal(null)} title="Confirm Delete">
          <p className="text-xs text-neutral-dark/70 font-semibold mb-4">
            Are you sure you want to delete <span className="font-bold text-red-600">{showDeleteModal.fullName}</span>?
            This removes their Firestore profile. Their Firebase Auth account will remain but they won't be able to use the app.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteModal(null)}
              className="flex-1 py-2.5 bg-neutral-light border border-neutral-border rounded-xl text-xs font-bold text-neutral-dark active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteUser(showDeleteModal.uid)}
              disabled={actionLoading}
              className="flex-1 py-2.5 bg-red-600 text-white border border-red-600 rounded-xl text-xs font-bold active:scale-95 transition-transform"
            >
              {actionLoading ? 'Deleting...' : '🗑️ Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;
