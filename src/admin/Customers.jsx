import React, { useEffect } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import Loader from '../components/common/Loader';
import { FaUserAlt } from 'react-icons/fa';

export const Customers = () => {
  const { customers, loading, fetchCustomers } = useAdmin();

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="flex-1 bg-neutral-light px-4 py-5 flex flex-col gap-4 pb-20 text-left">
      <div>
        <h2 className="text-lg font-bold text-neutral-dark">Customer Profiles</h2>
        <p className="text-[10px] text-neutral-dark/50 font-semibold mt-0.5">List of registered buyers</p>
      </div>

      {loading && customers.length === 0 ? (
        <Loader />
      ) : customers.length === 0 ? (
        <div className="p-8 bg-white border border-neutral-border rounded-3xl text-center text-xs font-semibold text-neutral-dark/40">
          No customers registered yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {customers.map((u) => (
            <div key={u.uid} className="bg-white p-3.5 rounded-2xl border border-neutral-border flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-bold border border-primary/10">
                <FaUserAlt />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-neutral-dark truncate">{u.fullName}</h4>
                <p className="text-[10px] text-neutral-dark/50 font-semibold mt-0.5">{u.email} • {u.phone || 'No phone'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Customers;
