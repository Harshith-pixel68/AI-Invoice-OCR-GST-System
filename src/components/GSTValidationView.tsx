import React, { useState, useEffect } from 'react';
import { Invoice, DBStats } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  SearchCode, 
  MapPin, 
  Copy, 
  ShieldAlert, 
  Filter, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Search
} from 'lucide-react';

interface GSTValidationViewProps {
  onReviewInvoice: (id: string) => void;
}

export default function GSTValidationView({ onReviewInvoice }: GSTValidationViewProps) {
  const [stats, setStats] = useState<DBStats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [validationFilter, setValidationFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatsAndInvoices = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    setLoading(true);
    try {
      // Fetch statistics
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch filtered and paginated invoices
      const params = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        validationStatus: validationFilter,
        page: currentPage.toString(),
        limit: '5',
      });
      
      const invoicesRes = await fetch(`/api/invoices?${params.toString()}`);
      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData.data);
        setTotalPages(invoicesData.totalPages);
        setTotalCount(invoicesData.totalCount);
      }
    } catch (error) {
      console.error('Failed to fetch GST Validation Hub data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatsAndInvoices();
  }, [searchQuery, statusFilter, validationFilter, currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // reset to page 1
  };

  return (
    <div id="gst-validation-hub-root" className="w-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-900">GST Validation Hub</h2>
          <p className="font-sans text-sm text-slate-500 mt-1">
            Real-time verification of extracted GSTINs against governmental databases.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fetchStatsAndInvoices(true)}
            className="bg-white text-indigo-600 border border-slate-200 font-sans text-sm font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-sm focus:outline-none"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        {/* Valid GST Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="font-sans text-xs font-semibold text-slate-500">Valid GST</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-[18px] h-[18px] text-emerald-600" />
            </div>
          </div>
          <div>
            <div className="font-sans text-2xl font-bold text-slate-900">
              {stats ? stats.validGST.toLocaleString() : '8,432'}
            </div>
            <div className="font-sans text-xs text-emerald-600 flex items-center mt-1">
              <span className="font-bold mr-1">↑ 12%</span> this week
            </div>
          </div>
        </div>

        {/* Invalid GST Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="font-sans text-xs font-semibold text-slate-500">Invalid</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
              <AlertTriangle className="w-[18px] h-[18px] text-rose-600" />
            </div>
          </div>
          <div>
            <div className="font-sans text-2xl font-bold text-slate-900">
              {stats ? stats.invalidGST.toLocaleString() : '142'}
            </div>
            <div className="font-sans text-xs text-rose-600 flex items-center mt-1">
              <span className="font-bold mr-1">⚠️</span> Action Required
            </div>
          </div>
        </div>

        {/* Missing GST Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="font-sans text-xs font-semibold text-slate-500">Missing GST</span>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
              <SearchCode className="w-[18px] h-[18px] text-slate-500" />
            </div>
          </div>
          <div>
            <div className="font-sans text-2xl font-bold text-slate-900">
              {stats ? stats.missingGST.toLocaleString() : '56'}
            </div>
            <div className="font-sans text-xs text-slate-500 mt-1">
              Requires manual entry
            </div>
          </div>
        </div>

        {/* State Mismatch Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="font-sans text-xs font-semibold text-slate-500">State Mismatch</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
              <MapPin className="w-[18px] h-[18px] text-amber-500" />
            </div>
          </div>
          <div>
            <div className="font-sans text-2xl font-bold text-slate-900">
              {stats ? stats.stateMismatch.toLocaleString() : '89'}
            </div>
            <div className="font-sans text-xs text-amber-500 mt-1">
              Verify Place of Supply
            </div>
          </div>
        </div>

        {/* Duplicate GST Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="font-sans text-xs font-semibold text-slate-500">Duplicate GST</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
              <Copy className="w-[18px] h-[18px] text-amber-500" />
            </div>
          </div>
          <div>
            <div className="font-sans text-2xl font-bold text-slate-900">
              {stats ? stats.duplicateGST.toLocaleString() : '24'}
            </div>
            <div className="font-sans text-xs text-slate-500 mt-1">
              Potential duplicate vendor
            </div>
          </div>
        </div>

        {/* Checksum Failed Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="font-sans text-xs font-semibold text-slate-500">Checksum Fail</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
              <ShieldAlert className="w-[18px] h-[18px] text-rose-500" />
            </div>
          </div>
          <div>
            <div className="font-sans text-2xl font-bold text-slate-900">
              {stats ? stats.checksumFail.toLocaleString() : '18'}
            </div>
            <div className="font-sans text-xs text-rose-500 mt-1">
              OCR Extraction Error
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 gap-4">
          <h3 className="font-sans text-lg font-semibold text-slate-900">Recent Validations</h3>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Inline search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Filter search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9 pr-4 py-1.5 w-full sm:w-48 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Validation Select Filter */}
            <select
              value={validationFilter}
              onChange={(e) => { setValidationFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Audits</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="warning">Warning</option>
            </select>

            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg focus:outline-none">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg focus:outline-none">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="font-sans text-xs font-semibold text-slate-500 py-3 px-4 uppercase tracking-wider">Vendor</th>
                <th className="font-sans text-xs font-semibold text-slate-500 py-3 px-4 uppercase tracking-wider">GST Number</th>
                <th className="font-sans text-xs font-semibold text-slate-500 py-3 px-4 uppercase tracking-wider">Validation Status</th>
                <th className="font-sans text-xs font-semibold text-slate-500 py-3 px-4 uppercase tracking-wider">Reason</th>
                <th className="font-sans text-xs font-semibold text-slate-500 py-3 px-4 uppercase tracking-wider">Invoice Number</th>
                <th className="font-sans text-xs font-semibold text-slate-500 py-3 px-4 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                      Checking active audit ledger...
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                    No validation records match the active filter metrics.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-4 font-sans font-medium text-slate-900">{inv.vendorName}</td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-600">
                      {inv.vendorGSTIN || <span className="text-slate-400 italic">Not Found</span>}
                    </td>
                    <td className="py-4 px-4">
                      {inv.validationStatus === 'pass' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-tight">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                        </span>
                      )}
                      {inv.validationStatus === 'fail' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-tight">
                          <ShieldAlert className="w-3.5 h-3.5" /> Fail
                        </span>
                      )}
                      {inv.validationStatus === 'warning' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-tight">
                          <AlertTriangle className="w-3.5 h-3.5" /> Warning
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-sans text-slate-500 text-xs max-w-xs truncate">
                      {inv.validationReason}
                    </td>
                    <td className="py-4 px-4 font-sans text-slate-600 text-xs font-medium">{inv.invoiceNumber}</td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => onReviewInvoice(inv.id)}
                        className="text-indigo-600 hover:text-indigo-800 hover:underline text-xs font-bold focus:outline-none"
                      >
                        {inv.validationStatus === 'pass' ? 'View' : inv.validationStatus === 'warning' ? 'Verify' : 'Review OCR'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500 font-sans">
          <span>
            Showing {invoices.length > 0 ? (currentPage - 1) * 5 + 1 : 0} to {Math.min(currentPage * 5, totalCount)} of {totalCount} entries
          </span>
          <div className="flex items-center gap-1">
            <button 
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-1 rounded border border-slate-200 hover:bg-slate-100 bg-white disabled:opacity-50 focus:outline-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-slate-700">Page {currentPage} of {totalPages || 1}</span>
            <button 
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-1 rounded border border-slate-200 hover:bg-slate-100 bg-white disabled:opacity-50 focus:outline-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
