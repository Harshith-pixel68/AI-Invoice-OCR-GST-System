import React, { useState, useEffect } from 'react';
import { Vendor } from '../types';
import { 
  Store, 
  Search, 
  MapPin, 
  ChevronRight, 
  TrendingUp, 
  Building2 
} from 'lucide-react';

export default function VendorsView() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/vendors');
        if (res.ok) {
          const data = await res.json();
          setVendors(data);
        }
      } catch (err) {
        console.error('Failed to fetch vendors directory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const filtered = vendors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.gstin.toLowerCase().includes(search.toLowerCase()) ||
    v.stateCode.includes(search)
  );

  return (
    <div id="vendors-directory-root" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-indigo-600" />
            Corporate Vendor Directory
          </h2>
          <p className="text-sm text-slate-500 mt-1">Directory mapping certified suppliers, unique GST identification keys, and active contract allocations.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/80 gap-4">
          <h3 className="font-sans text-sm font-bold text-slate-900">Validated Suppliers ({filtered.length})</h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by vendor name or GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 uppercase text-slate-400 font-semibold">
                <th className="py-3 px-4">Supplier Identity</th>
                <th className="py-3 px-4">Tax registration (GSTIN)</th>
                <th className="py-3 px-4">Corporate Headquarters</th>
                <th className="py-3 px-4">Volume allocated</th>
                <th className="py-3 px-4">Cumulative spend</th>
                <th className="py-3 px-4 text-right">Last transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                    Resolving active supplier registries...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                    No validated vendors match active criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((ven) => (
                  <tr key={ven.gstin} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {ven.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                        {ven.gstin}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">{ven.address}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-600 font-semibold">{ven.invoiceCount} invoices</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ₹{ven.totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 text-xs">{ven.lastActive}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
