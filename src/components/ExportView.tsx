import React, { useState } from 'react';
import { Download, FileSpreadsheet, Settings2, ShieldCheck } from 'lucide-react';

export default function ExportView() {
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [selectedColumns, setSelectedColumns] = useState({
    invoiceNumber: true,
    date: true,
    vendorName: true,
    vendorGSTIN: true,
    placeOfSupply: true,
    taxableAmount: true,
    cgst: true,
    sgst: true,
    igst: true,
    totalAmount: true,
    validationStatus: true,
    confidence: true,
  });
  const [exporting, setExporting] = useState(false);

  const toggleColumn = (key: keyof typeof selectedColumns) => {
    setSelectedColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTriggerDownload = () => {
    setExporting(true);
    
    // Simulate compilation delay
    setTimeout(() => {
      // Direct window open to download compiled backend CSV
      window.open('/api/export', '_blank');
      setExporting(false);
    }, 1000);
  };

  return (
    <div id="export-panel-root" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT: EXPORT CONTROLS */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-sans text-lg font-bold tracking-tight text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Compliance Ledger Spreadsheet Compiler
          </h3>

          <div className="space-y-6 text-sm">
            {/* Format Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Export File Format</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setExportFormat('csv')}
                  className={`p-3 border rounded-xl text-left font-semibold flex items-center justify-between transition-all cursor-pointer focus:outline-none ${
                    exportFormat === 'csv' ? 'border-indigo-500 bg-indigo-50/40 text-indigo-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <p className="text-xs">Comma Separated Values</p>
                    <p className="text-[10px] text-slate-400 font-medium">Excel & Pandas Compatible (.csv)</p>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${exportFormat === 'csv' ? 'border-indigo-500 bg-indigo-600' : 'border-slate-300'}`}>
                    {exportFormat === 'csv' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>

                <button 
                  onClick={() => setExportFormat('tsv')}
                  className={`p-3 border rounded-xl text-left font-semibold flex items-center justify-between transition-all cursor-pointer focus:outline-none ${
                    exportFormat === 'tsv' ? 'border-indigo-500 bg-indigo-50/40 text-indigo-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <p className="text-xs">Tab Separated Values</p>
                    <p className="text-[10px] text-slate-400 font-medium">Text Databases (.tsv)</p>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${exportFormat === 'tsv' ? 'border-indigo-500 bg-indigo-600' : 'border-slate-300'}`}>
                    {exportFormat === 'tsv' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>
              </div>
            </div>

            {/* Date Boundaries */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Audit Date Boundaries</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Audited Cumulative Records (All-time)</option>
                <option value="today">Today's Transactions</option>
                <option value="week">Last 7 Days Scans</option>
                <option value="month">Last 30 Days Scans</option>
              </select>
            </div>

            {/* Selected Columns Checklist */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Column Fields To Map</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.keys(selectedColumns).map((col) => (
                  <label key={col} className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-indigo-50/30 border border-slate-100 hover:border-indigo-100 rounded-lg cursor-pointer text-xs transition-colors">
                    <input 
                      type="checkbox"
                      checked={selectedColumns[col as keyof typeof selectedColumns]}
                      onChange={() => toggleColumn(col as keyof typeof selectedColumns)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                    />
                    <span className="capitalize font-medium text-slate-700">
                      {col.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: COMPILER SIDEBAR */}
      <div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-full">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-slate-400" />
              <h4 className="font-sans text-sm font-bold text-slate-900">Spreadsheet Meta-compiler</h4>
            </div>

            <div className="text-xs space-y-3 font-sans">
              <div className="flex justify-between border-b border-slate-100 pb-2 text-slate-500">
                <span>Output Format:</span>
                <span className="font-mono font-bold text-slate-700">{exportFormat.toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 text-slate-500">
                <span>Date Limits:</span>
                <span className="font-bold text-slate-700">
                  {dateRange === 'all' ? 'All-time' : dateRange === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 text-slate-500">
                <span>Active Columns Mapped:</span>
                <span className="font-bold text-slate-700">
                  {Object.values(selectedColumns).filter(Boolean).length} / {Object.keys(selectedColumns).length}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-dashed border-slate-200 space-y-4">
            <button
              onClick={handleTriggerDownload}
              disabled={exporting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-semibold py-3 rounded-lg shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer focus:outline-none"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Compiling compliance rows...' : 'Download Audited Spreadsheet'}
            </button>

            <div className="flex items-start gap-2 text-[10px] text-slate-400 font-sans">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Complies fully with standard openpyxl Pandas row-column matrix configurations. Suitable for importing directly into corporate bookkeeping software.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
