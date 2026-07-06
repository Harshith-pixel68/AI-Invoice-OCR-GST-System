import React, { useState, useEffect } from 'react';
import { Invoice } from '../types';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertTriangle, 
  AlertCircle,
  Play 
} from 'lucide-react';

interface PendingReviewViewProps {
  onReviewInvoice: (id: string) => void;
}

export default function PendingReviewView({ onReviewInvoice }: PendingReviewViewProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search,
          status: 'pending_review',
          page: currentPage.toString(),
          limit: '10'
        });
        const res = await fetch(`/api/invoices?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setInvoices(data.data);
          setTotalPages(data.totalPages);
          setTotalCount(data.totalCount);
        }
      } catch (err) {
        console.error('Failed to load pending invoices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, [search, currentPage]);

  return (
    <div id="pending-review-root" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            Exceptions Audit Queue
          </h2>
          <p className="text-sm text-slate-500 mt-1">Review ledger records containing low confidence parameters or matching tax discrepancy markers.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/80 gap-4">
          <h3 className="font-sans text-sm font-bold text-slate-900">Awaiting Remediation ({totalCount})</h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search exceptions..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 uppercase text-slate-400 font-semibold">
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Discrepancy Marker</th>
                <th className="py-3 px-4">Reason Statement</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4 text-right">Workbench</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    Auditing exceptional queue indexes...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    Perfect! There are no exceptions awaiting remediation in the queue.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-sans font-medium text-slate-700">{inv.vendorName}</td>
                    <td className="py-3.5 px-4">
                      {inv.validationStatus === 'fail' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                          <AlertCircle className="w-3.5 h-3.5" /> High Discrepancy
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                          <AlertTriangle className="w-3.5 h-3.5" /> Low Warning
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-sans text-slate-500 max-w-xs truncate">{inv.validationReason}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">₹{inv.totalAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className={`font-semibold ${inv.confidence > 80 ? 'text-amber-600' : 'text-rose-500'}`}>
                        {inv.confidence}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => onReviewInvoice(inv.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-100 transition-all ml-auto focus:outline-none cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        Remediate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/80 flex justify-between items-center text-xs text-slate-500 font-sans">
          <span>
            Showing {invoices.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to {Math.min(currentPage * 10, totalCount)} of {totalCount} entries
          </span>
          <div className="flex items-center gap-1">
            <button 
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-1 rounded border border-slate-200 hover:bg-slate-100 bg-white disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-slate-700">Page {currentPage} of {totalPages || 1}</span>
            <button 
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-1 rounded border border-slate-200 hover:bg-slate-100 bg-white disabled:opacity-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
