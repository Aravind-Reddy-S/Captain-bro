import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTimes, FaHome, FaShoppingBag, FaHistory, FaUser, FaClipboardList, FaMotorcycle } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-neutral-dark/40 backdrop-blur-xs" onClick={onClose}></div>

      {/* Drawer */}
      <div className="relative w-64 bg-white h-full shadow-2xl flex flex-col z-10 border-r border-neutral-border">
        {/* Header */}
        <div className="p-5 border-b border-neutral-border flex items-center justify-between">
          <div className="flex flex-col text-left">
            <span className="font-bold text-primary text-sm uppercase">Mana Warangal</span>
            <span className="text-xs font-semibold text-neutral-dark opacity-60">Navigation Menu</span>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-dark opacity-60 hover:opacity-100">
            <FaTimes />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 p-4 flex flex-col gap-1 text-left">
          <NavLink to="/home" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-light font-semibold text-neutral-dark text-sm transition-all">
            <FaHome className="text-primary text-base" />
            <span>Home</span>
          </NavLink>
          <NavLink to="/products" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-light font-semibold text-neutral-dark text-sm transition-all">
            <FaShoppingBag className="text-primary text-base" />
            <span>Browse Products</span>
          </NavLink>
          <NavLink to="/orders" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-light font-semibold text-neutral-dark text-sm transition-all">
            <FaHistory className="text-primary text-base" />
            <span>My Orders</span>
          </NavLink>
          <NavLink to="/profile" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-light font-semibold text-neutral-dark text-sm transition-all">
            <FaUser className="text-primary text-base" />
            <span>My Profile</span>
          </NavLink>

          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
            <>
              <div className="h-px bg-neutral-border my-2"></div>
              <span className="text-[10px] font-bold text-neutral-dark opacity-40 px-3 uppercase tracking-wider">
                {currentUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
              <NavLink to="/admin" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-light font-semibold text-neutral-dark text-sm transition-all">
                <FaClipboardList className="text-secondary-dark text-base" />
                <span>Admin Dashboard</span>
              </NavLink>
            </>
          )}

          {currentUser && currentUser.role === 'rider' && (
            <>
              <div className="h-px bg-neutral-border my-2"></div>
              <span className="text-[10px] font-bold text-neutral-dark opacity-40 px-3 uppercase tracking-wider">Rider</span>
              <NavLink to="/rider" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-light font-semibold text-neutral-dark text-sm transition-all">
                <FaMotorcycle className="text-secondary-dark text-base" />
                <span>Rider Dashboard</span>
              </NavLink>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-border">
          {currentUser ? (
            <button
              onClick={() => { logout(); onClose(); }}
              className="w-full py-2.5 bg-neutral-light hover:bg-primary-light hover:text-primary text-neutral-dark font-bold rounded-xl text-xs transition-all border border-neutral-border hover:border-primary/20"
            >
              Sign Out
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={onClose}
              className="block text-center w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs shadow-md shadow-primary/20 hover:bg-primary-dark transition-all"
            >
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
