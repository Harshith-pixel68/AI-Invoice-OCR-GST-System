import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Settings2, 
  FileCheck2, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle, 
  Play,
  FileText
} from 'lucide-react';
import { Invoice } from '../types';

interface UploadViewProps {
  onUploadSuccess: (invoice: Invoice) => void;
}

const SAMPLE_INVOICES_FOR_DEMO = [
  {
    fileName: 'acme_freight_june.png',
    label: 'Acme Corp Freight Scan (Valid)',
    ocrProvider: 'Google Document AI',
    fileType: 'image/png',
    // Mock base64 representable string
    fileData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  },
  {
    fileName: 'global_supplies_checksum_fail.png',
    label: 'Global Tech Invoice Scan (Invalid GST Checksum)',
    ocrProvider: 'Tesseract Engine',
    fileType: 'image/png',
    fileData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  },
  {
    fileName: 'rapid_trans_mismatch.png',
    label: 'Rapid Transport Slip (State Code Mismatch Warning)',
    ocrProvider: 'OmniVision AI',
    fileType: 'image/png',
    fileData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  },
  {
    fileName: 'stationery_no_gst.png',
    label: 'National Stationery Receipt (Missing GSTIN)',
    ocrProvider: 'Google Document AI',
    fileType: 'image/png',
    fileData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  }
];

export default function UploadView({ onUploadSuccess }: UploadViewProps) {
  const [ocrProvider, setOcrProvider] = useState('Google Document AI');
  const [runAI, setRunAI] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [processedInvoice, setProcessedInvoice] = useState<Invoice | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Convert uploaded file to base64 and send to server API
  const processFile = async (file: File) => {
    setUploading(true);
    setUploadStatus(`Initializing OCR connection via ${ocrProvider}...`);
    setProcessedInvoice(null);
    
    try {
      const base64Data = await convertToBase64(file);
      // Strip metadata header if needed, but our server expects raw base64 string
      const cleanBase64 = base64Data.split(',')[1] || base64Data;

      sendUploadRequest(file.name, file.type, cleanBase64, ocrProvider);
    } catch (err: any) {
      setUploadStatus(`File parsing failed: ${err.message}`);
      setUploading(false);
    }
  };

  // Trigger one of the sample demo uploads
  const handleSampleUpload = (sample: typeof SAMPLE_INVOICES_FOR_DEMO[0]) => {
    setUploading(true);
    setUploadStatus(`Simulating upload for ${sample.fileName} using ${sample.ocrProvider}...`);
    setProcessedInvoice(null);
    
    // Simulate slight network delay representing OCR scan
    setTimeout(() => {
      sendUploadRequest(sample.fileName, sample.fileType, sample.fileData, sample.ocrProvider);
    }, 1200);
  };

  const sendUploadRequest = async (fileName: string, fileType: string, fileData: string, provider: string) => {
    setUploadStatus('Running AI Structured Field Extraction & GST Compliance checks...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      try {
        controller.abort();
      } catch (e) {
        console.error('Error aborting request:', e);
      }
    }, 120000); // 120 seconds timeout limit for full OCR and AI processing

    try {
      const res = await fetch('/api/invoices/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          fileName,
          fileType,
          fileData,
          ocrProvider: provider,
          runAI
        })
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.details || 'Structured OCR response failed');
      }
      
      const invoice: Invoice = await res.json();
      
      setProcessedInvoice(invoice);
      setUploadStatus(null);
      onUploadSuccess(invoice);
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error(error);
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        setUploadStatus('Compliance checks failed: The request timed out after 120 seconds.');
      } else {
        setUploadStatus(`Compliance checks failed: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div id="upload-view-root" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT: CONFIGURATION AND FILE UPLOADER */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-sans text-lg font-bold tracking-tight text-slate-900 border-b border-slate-100 pb-3 mb-4">Invoice OCR Processing Engine</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Active OCR Provider Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Settings2 className="w-3.5 h-3.5" />
                OCR Engine Provider
              </label>
              <select
                value={ocrProvider}
                onChange={(e) => setOcrProvider(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Google Document AI">Google Document AI (Enterprise Precision)</option>
                <option value="Tesseract Engine">Tesseract OCR (Open-Source fallback)</option>
                <option value="OmniVision AI">OmniVision AI (High-Speed pipeline)</option>
              </select>
            </div>

            {/* AI Field Extraction Toggle */}
            <div className="flex flex-col justify-end">
              <label className="relative flex items-center gap-2 cursor-pointer py-2.5">
                <input 
                  type="checkbox"
                  checked={runAI}
                  onChange={(e) => setRunAI(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 border-slate-300"
                />
                <div className="text-sm">
                  <p className="font-bold text-slate-800">AI Field Extraction</p>
                  <p className="text-xs text-slate-400">Apply Gemini LLM schema-matching normalization</p>
                </div>
              </label>
            </div>
          </div>

          {/* Interactive Drag & Drop Area */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-500 hover:bg-slate-50/50'
            }`}
          >
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="hidden"
            />
            
            <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="font-sans font-bold text-slate-800 text-sm">Drag and drop invoice scan files here</p>
            <p className="text-xs text-slate-400 mt-1">Supports PNG, JPEG, or PDF formats up to 50MB</p>
            <button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-semibold px-4 py-2 rounded-lg shadow-md shadow-indigo-100 transition-all focus:outline-none">
              Browse Files
            </button>
          </div>
        </div>

        {/* DEMO / TESTING AID: PRE-LOADED SAMPLES */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div>
            <h4 className="font-sans text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              Demo Testing Kit: Fast Simulated Document Uploads
            </h4>
            <p className="text-xs text-slate-400 mt-1">Click a pre-loaded invoice document mock pattern below to run compliance test audits against the backend API instantly.</p>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {SAMPLE_INVOICES_FOR_DEMO.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSampleUpload(sample)}
                disabled={uploading}
                className="p-3 text-left border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex items-center justify-between group disabled:opacity-50 cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText className="w-5 h-5 text-slate-400 shrink-0 group-hover:text-indigo-500" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-800 truncate">{sample.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Mime: {sample.fileType} | Provider: {sample.ocrProvider}</p>
                  </div>
                </div>
                <Play className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: REAL-TIME COMPLIANCE AUDIT AUDIENCE LOGS */}
      <div className="space-y-6">
        <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-6 shadow-sm h-full min-h-[350px] flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-sans text-sm font-bold text-slate-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                OCR AI Pipeline Audit Console
              </h3>
            </div>

            {/* Audit Pipeline State Indicator */}
            {uploading ? (
              <div className="space-y-4">
                <p className="text-xs text-indigo-400 font-mono animate-pulse">{uploadStatus}</p>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-indigo-500 rounded-full animate-pulse" />
                </div>
                <div className="text-[11px] text-slate-500 space-y-1 font-mono">
                  <p>&gt; Connection established on socket channel.</p>
                  <p>&gt; Initializing high-speed pixel matrix normalization...</p>
                  <p>&gt; Launching structured schema parser...</p>
                </div>
              </div>
            ) : processedInvoice ? (
              <div className="space-y-4">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-800 flex items-start gap-2.5 text-xs">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-200">Extraction Completed Successfully</p>
                    <p className="text-slate-400 mt-0.5">OCR confidence rate matches threshold expectations.</p>
                  </div>
                </div>

                <div className="text-xs space-y-2 font-mono">
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">Invoice:</span>
                    <span className="text-slate-200 font-bold">{processedInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">Vendor:</span>
                    <span className="text-slate-200 truncate max-w-[180px]">{processedInvoice.vendorName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">Vendor GSTIN:</span>
                    <span className="text-slate-200 font-bold">{processedInvoice.vendorGSTIN || 'MISSING'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">Audit Status:</span>
                    <span className={`font-bold ${
                      processedInvoice.validationStatus === 'pass' ? 'text-emerald-400' :
                      processedInvoice.validationStatus === 'warning' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {processedInvoice.validationStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">Total Spend:</span>
                    <span className="text-indigo-400 font-bold">₹{processedInvoice.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <UploadCloud className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                <p className="text-xs font-sans">No active upload stream detected.</p>
                <p className="text-[10px] mt-1">Upload a scanned billing paper or sample file to view structured audit execution.</p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-800/60 pt-3 flex justify-between">
            <span>Gateway Ingress: Active</span>
            <span>Firmware: v2.5.0-Stitch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
