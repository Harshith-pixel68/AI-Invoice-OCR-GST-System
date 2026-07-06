import React, { useState } from 'react';
import { Settings, RefreshCw, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export default function SettingsView() {
  const [resetting, setResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const handleResetDatabase = async () => {
    if (!window.confirm('Are you sure you want to reset the database? This will clear all newly added invoices and restore initial demo templates.')) {
      return;
    }
    setResetting(true);
    setResetStatus('Erasing custom rows...');
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        setResetStatus('Success! Factory database records successfully restored.');
        setTimeout(() => {
          setResetStatus(null);
          // Reload page to re-fetch all statistics
          window.location.reload();
        }, 1500);
      } else {
        throw new Error('Database reset failed');
      }
    } catch (e: any) {
      setResetStatus(`Reset failed: ${e.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div id="settings-view-root" className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          System Settings & Workbench Configs
        </h2>
        <p className="text-sm text-slate-500 mt-1">Configure active OCR compliance constraints, PAN matching parameters, and test databases.</p>
      </div>

      {/* Database control card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-sans text-base font-bold text-slate-900">Database & State Control Panel</h3>
          <p className="text-xs text-slate-400 mt-0.5">Reset the entire server database state back to its initial 5-item mock template plus 45 randomized rows for testing.</p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleResetDatabase}
            disabled={resetting}
            className="bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-200 font-sans text-xs font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer focus:outline-none"
          >
            <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
            Reset Database to Default Factory Demo State
          </button>

          {resetStatus && (
            <p className="text-xs font-semibold mt-3 text-rose-600 font-sans flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              {resetStatus}
            </p>
          )}
        </div>
      </div>

      {/* Mocking configurations for OCR and AI */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-sans text-base font-bold text-slate-900">Compliance & Validation Rules</h3>
          <p className="text-xs text-slate-400 mt-0.5">Define active verification parameters applied during document ingest.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100 hover:border-slate-200/50 transition-colors">
            <span className="font-bold text-slate-700 block mb-1">Luhn Algorithm (Mod 36) Checksum</span>
            <p className="text-slate-400">Validate characters on position 15 dynamically to filter OCR extraction errors.</p>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded mt-2.5 inline-block border border-emerald-100">Active (Non-Bypassable)</span>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100 hover:border-slate-200/50 transition-colors">
            <span className="font-bold text-slate-700 block mb-1">Regional Place Of Supply (POS) Match</span>
            <p className="text-slate-400">Trigger warnings if the state identifier inside the vendor GSTIN does not map to POS code.</p>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded mt-2.5 inline-block border border-emerald-100">Active (Non-Bypassable)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
