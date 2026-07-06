import React, { useState } from 'react';
import { TabType } from './types';
import GSTValidationView from './components/GSTValidationView';
import ValidationHubModal from './components/ValidationHubModal';
import DashboardView from './components/DashboardView';
import UploadView from './components/UploadView';
import ProcessedView from './components/ProcessedView';
import PendingReviewView from './components/PendingReviewView';
import VendorsView from './components/VendorsView';
import ReportsView from './components/ReportsView';
import ExportView from './components/ExportView';
import SettingsView from './components/SettingsView';

import { 
  LayoutDashboard, 
  UploadCloud, 
  CheckSquare, 
  Clock, 
  FileCheck, 
  Store, 
  BarChart3, 
  Download, 
  Settings, 
  Plus, 
  Search, 
  Bell, 
  HelpCircle, 
  User,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  // Start on the exact GST Validation screen shown in the user's screenshot
  const [activeTab, setActiveTab] = useState<TabType>('gst_validation');
  const [remediatingInvoiceId, setRemediatingInvoiceId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleReviewInvoice = (id: string) => {
    setRemediatingInvoiceId(id);
  };

  const handleAuditSaved = () => {
    // Refresh page or individual elements. Reload is fine, but resetting state works instantly
    setRemediatingInvoiceId(null);
  };

  // Nav items array for scannable loop
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload' as TabType, label: 'Upload', icon: UploadCloud },
    { id: 'processed' as TabType, label: 'Processed', icon: CheckSquare },
    { id: 'pending_review' as TabType, label: 'Pending Review', icon: Clock },
    { id: 'gst_validation' as TabType, label: 'GST Validation', icon: FileCheck },
    { id: 'vendors' as TabType, label: 'Vendors', icon: Store },
    { id: 'reports' as TabType, label: 'Reports', icon: BarChart3 },
    { id: 'export' as TabType, label: 'Export', icon: Download },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <div id="application-root" className="bg-slate-50 text-slate-900 antialiased min-h-screen font-sans flex flex-col overflow-x-hidden">
      
      <div className="flex flex-1 min-h-screen">
        {/* 1. FIXED DESKTOP LEFT SIDEBAR */}
        <nav id="desktop-side-nav" className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[280px] h-full bg-white border-r border-slate-200 py-6 gap-2 overflow-y-auto z-40">
          <div className="px-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">LOGI <span className="text-indigo-600">OCR</span></span>
            </div>
            <div className="mt-2 inline-block px-2 py-1 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase tracking-widest">Enterprise V2.4</div>
          </div>

          <div className="flex-1 flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors text-left w-full focus:outline-none ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sidebar Action Button */}
          <div className="px-4 mt-4 mb-4">
            <button 
              onClick={() => setActiveTab('upload')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-xs focus:outline-none"
            >
              <Plus className="w-4 h-4" />
              New Analysis
            </button>
          </div>

          {/* Storage Utilization */}
          <div className="px-4">
            <div className="p-4 bg-slate-900 rounded-xl text-white">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Storage Utilization</div>
              <div className="text-lg font-semibold">84.2 GB</div>
              <div className="w-full bg-slate-700 h-1 rounded-full mt-2">
                <div className="bg-indigo-400 h-1 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="text-[10px] text-slate-400 mt-2">PostgreSQL / Neon</div>
            </div>
          </div>
        </nav>

        {/* 2. MOBILE RESPONSIVE SIDEBAR DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden animate-fade-in">
            <div className="w-[280px] h-full bg-white flex flex-col py-6 gap-2 border-r border-slate-200 relative">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 p-1.5 rounded-lg border border-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="px-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <span className="text-xl font-bold tracking-tight text-slate-800">LOGI <span className="text-indigo-600">OCR</span></span>
                </div>
                <div className="mt-2 inline-block px-2 py-1 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase tracking-widest">Enterprise V2.4</div>
              </div>

              <div className="flex-1 flex flex-col gap-1 px-3">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors text-left w-full focus:outline-none ${
                        isActive 
                          ? 'bg-indigo-50 text-indigo-700 font-bold' 
                          : 'text-slate-600 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="px-4 mt-auto mb-4">
                <button 
                  onClick={() => {
                    setActiveTab('upload');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <Plus className="w-4 h-4" />
                  New Analysis
                </button>
              </div>

              {/* Storage Utilization */}
              <div className="px-4">
                <div className="p-4 bg-slate-900 rounded-xl text-white">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Storage Utilization</div>
                  <div className="text-lg font-semibold">84.2 GB</div>
                  <div className="w-full bg-slate-700 h-1 rounded-full mt-2">
                    <div className="bg-indigo-400 h-1 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2">PostgreSQL / Neon</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. MAIN WORKSPACE */}
        <div id="main-workspace-wrapper" className="flex-1 flex flex-col min-h-screen md:ml-[280px] overflow-hidden">
          
          {/* TOP COMPACT APPBAR */}
          <header className="sticky top-0 h-16 bg-white border-b border-slate-200 z-30 flex justify-between items-center px-6">
            <div className="flex items-center flex-1 gap-4">
              {/* Mobile Hamburger menu */}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-600 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Desktop search bar */}
              <div className="relative w-72 hidden sm:block">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search invoices, GST..."
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  disabled
                />
              </div>

              <div className="md:hidden">
                <span className="text-sm font-bold text-indigo-600 tracking-tight">LOGI OCR</span>
              </div>
            </div>

            {/* Quick Toolbar icons matching Enterprise V2.4 design style */}
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-xs font-medium text-slate-500">Engine: Google Vision API</span>
              </div>
              <div className="hidden lg:block w-px h-6 bg-slate-200"></div>
              <div className="flex items-center gap-3">
                <div className="text-right leading-tight hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800">Architect User</div>
                  <div className="text-[10px] text-slate-400">System Administrator</div>
                </div>
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-bold rounded-full border border-slate-200 flex items-center justify-center">
                  AU
                </div>
              </div>
            </div>
          </header>

          {/* MAIN CANVAS BODY AREA */}
          <main className="flex-1 p-6 md:p-8 w-full max-w-7xl mx-auto flex flex-col gap-6">
            {activeTab === 'dashboard' && (
              <DashboardView onNavigate={setActiveTab} onReviewInvoice={handleReviewInvoice} />
            )}
            {activeTab === 'upload' && (
              <UploadView onUploadSuccess={(inv) => handleReviewInvoice(inv.id)} />
            )}
            {activeTab === 'processed' && (
              <ProcessedView onReviewInvoice={handleReviewInvoice} />
            )}
            {activeTab === 'pending_review' && (
              <PendingReviewView onReviewInvoice={handleReviewInvoice} />
            )}
            {activeTab === 'gst_validation' && (
              <GSTValidationView onReviewInvoice={handleReviewInvoice} />
            )}
            {activeTab === 'vendors' && (
              <VendorsView />
            )}
            {activeTab === 'reports' && (
              <ReportsView />
            )}
            {activeTab === 'export' && (
              <ExportView />
            )}
            {activeTab === 'settings' && (
              <SettingsView />
            )}
          </main>

          {/* Connected Enterprise Database Footer */}
          <footer className="h-10 bg-slate-100 border-t border-slate-200 px-8 flex items-center justify-between text-[10px] text-slate-400 flex-shrink-0">
            <div>Connected to: <span className="font-semibold">neon-db-prod-east-1.sql.neon.tech</span></div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                FastAPI Gateway Active
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Redis Cache Connected
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* 4. SPLIT-SCREEN RE-AUDIT WORKBENCH OVERLAY */}
      {remediatingInvoiceId && (
        <ValidationHubModal 
          invoiceId={remediatingInvoiceId} 
          onClose={() => setRemediatingInvoiceId(null)} 
          onSaved={handleAuditSaved} 
        />
      )}
    </div>
  );
}
