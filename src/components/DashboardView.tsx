import React, { useState, useEffect } from 'react';
import { DBStats, Invoice } from '../types.js';
import { 
  DollarSign, 
  Files, 
  TrendingUp, 
  Cpu, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  PlayCircle
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
  onReviewInvoice: (id: string) => void;
}

export default function DashboardView({ onNavigate, onReviewInvoice }: DashboardViewProps) {
  const [stats, setStats] = useState<DBStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        const invoicesRes = await fetch('/api/invoices?limit=5');
        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json();
          setRecentInvoices(invoicesData.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div id="dashboard-view-root" className="space-y-8">
      {/* Upper Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-900">Enterprise Processing Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time overview of AI document extractions, invoice flows, and GST audit queues.</p>
        </div>
        <button 
          onClick={() => onNavigate('upload')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-sm font-semibold py-2.5 px-4 rounded-lg shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 focus:outline-none cursor-pointer"
        >
          <PlayCircle className="w-4 h-4" />
          Analyze New Invoice
        </button>
      </div>

      {/* Aggregate Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Spend */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audited Spend (INR)</p>
              <h3 className="font-sans text-2xl font-bold text-slate-900 mt-1">
                ₹{stats ? stats.totalSpend.toLocaleString('en-IN') : '0'}
              </h3>
            </div>
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 font-bold" />
            <span className="text-emerald-600 font-bold">14% growth</span> vs last month
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Scanned Invoices</p>
              <h3 className="font-sans text-2xl font-bold text-slate-900 mt-1">
                {stats ? stats.totalInvoices : '0'}
              </h3>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg text-slate-600">
              <Files className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">From all swappable OCR providers</p>
        </div>

        {/* Pending Review count */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Awaiting Verification</p>
              <h3 className="font-sans text-2xl font-bold text-slate-900 mt-1 text-amber-600">
                {stats ? stats.pendingReviewInvoices : '0'}
              </h3>
            </div>
            <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Exception validation warnings found</p>
        </div>

        {/* OCR Average Confidence */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average OCR Accuracy</p>
              <h3 className="font-sans text-2xl font-bold text-slate-900 mt-1 text-emerald-600">
                {stats ? `${stats.averageConfidence}%` : '0%'}
              </h3>
            </div>
            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Enhanced via Gemini LLM</p>
        </div>
      </div>

      {/* Grid Layout: Active Processing States and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Compliance Audits Distribution Chart (styled) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-sans text-sm font-bold text-slate-900 border-b border-slate-100 pb-3.5 mb-4">
              GST Validation Quality Index
            </h3>
            
            <div className="space-y-4 py-2">
              {/* Pass percentage */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Pass (Perfect Alignment)</span>
                  <span>{stats && stats.totalInvoices ? Math.round((stats.validGST / stats.totalInvoices) * 100) : 75}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ width: `${stats && stats.totalInvoices ? (stats.validGST / stats.totalInvoices) * 100 : 75}%` }} 
                  />
                </div>
              </div>

              {/* Warnings percentage */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Warnings (State Mismatches)</span>
                  <span>{stats && stats.totalInvoices ? Math.round((stats.stateMismatch / stats.totalInvoices) * 100) : 15}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full" 
                    style={{ width: `${stats && stats.totalInvoices ? (stats.stateMismatch / stats.totalInvoices) * 100 : 15}%` }} 
                  />
                </div>
              </div>

              {/* Fail percentage */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Fails (Format Errors/Missing GST)</span>
                  <span>{stats && stats.totalInvoices ? Math.round(((stats.invalidGST - stats.stateMismatch) / stats.totalInvoices) * 100) : 10}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full rounded-full" 
                    style={{ width: `${stats && stats.totalInvoices ? (Math.max(0, stats.invalidGST - stats.stateMismatch) / stats.totalInvoices) * 100 : 10}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium border-t border-slate-100 pt-3 mt-4">
            Total ledger entries audited: {stats ? stats.totalInvoices : '0'} Invoices
          </div>
        </div>

        {/* Recent Invoices Pipeline Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-4">
              <h3 className="font-sans text-sm font-bold text-slate-900">
                Active Processing Pipeline Stream
              </h3>
              <button 
                onClick={() => onNavigate('processed')}
                className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-semibold focus:outline-none"
              >
                View Processing Queue
              </button>
            </div>

            <div className="overflow-x-auto min-h-[180px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-semibold uppercase">
                    <th className="py-2 px-3">Invoice</th>
                    <th className="py-2 px-3">Vendor</th>
                    <th className="py-2 px-3">GST State</th>
                    <th className="py-2 px-3">Amount</th>
                    <th className="py-2 px-3 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-500 font-sans">
                        Reading pipeline stream...
                      </td>
                    </tr>
                  ) : recentInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-500 font-sans">
                        No invoices scanned yet. Upload your first document!
                      </td>
                    </tr>
                  ) : (
                    recentInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-600 font-medium truncate max-w-[150px]">{inv.vendorName}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-500 text-xs">{inv.placeOfSupply}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-900 font-bold">₹{inv.totalAmount.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onReviewInvoice(inv.id)}
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                              inv.validationStatus === 'pass' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:underline' :
                              inv.validationStatus === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100 hover:underline' :
                              'bg-rose-50 text-rose-700 border-rose-100 hover:underline'
                            }`}
                          >
                            {inv.validationStatus.toUpperCase()}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-4 text-xs text-slate-400 font-medium">
            *Manual overrides are automatically certified with 100% confidence.
          </div>
        </div>

      </div>
    </div>
  );
}
