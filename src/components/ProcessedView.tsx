import React, { useState, useEffect } from 'react';
import { Invoice } from '../types';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  FileCheck2, 
  Download, 
  ArrowUpRight 
} from 'lucide-react';

interface ProcessedViewProps {
  onReviewInvoice: (id: string) => void;
}

export default function ProcessedView({ onReviewInvoice }: ProcessedViewProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchProcessed = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search,
          status: 'processed',
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
        console.error('Failed to load processed invoices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProcessed();
  }, [search, currentPage]);

  const handleDownloadCSV = () => {
    window.open('/api/export?status=processed', '_blank');
  };

  return (
    <div id="processed-view-root" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-600" />
            Processed Ledger Archive
          </h2>
          <p className="text-sm text-slate-500 mt-1">Directory of invoices with 100% clean audits, active GST registrations, and matching state metrics.</p>
        </div>
        <button 
          onClick={handleDownloadCSV}
          className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-sans text-xs font-semibold py-2 px-3 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer focus:outline-none"
        >
          <Download className="w-3.5 h-3.5" />
          Export Processed list (CSV)
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/80 gap-4">
          <h3 className="font-sans text-sm font-bold text-slate-900">Cleared Invoices ({totalCount})</h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search processed records..."
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
                <th className="py-3 px-4">Vendor GSTIN</th>
                <th className="py-3 px-4">Place of Supply</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    Searching cleared ledger index...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No successfully processed invoices found matching query.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-sans font-medium text-slate-700">{inv.vendorName}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{inv.vendorGSTIN}</td>
                    <td className="py-3.5 px-4 text-slate-500">{inv.placeOfSupply}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">₹{inv.totalAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-semibold">{inv.confidence}%</td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => onReviewInvoice(inv.id)}
                        className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold text-xs flex items-center gap-1 ml-auto cursor-pointer focus:outline-none"
                      >
                        Details
                        <ArrowUpRight className="w-3.5 h-3.5" />
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
