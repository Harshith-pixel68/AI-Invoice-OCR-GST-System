import React, { useState, useEffect } from 'react';
import { Invoice, LineItem } from '../types';
import { 
  X, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Trash2,
  Lock,
  Building,
  MapPin,
  Calendar,
  Layers,
  FileCheck2,
  Receipt,
  RefreshCw
} from 'lucide-react';

const STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli and Daman & Diu',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh (New)',
  '38': 'Ladakh'
};

interface ValidationHubModalProps {
  invoiceId: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function ValidationHubModal({ invoiceId, onClose, onSaved }: ValidationHubModalProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable fields state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorGSTIN, setVendorGSTIN] = useState('');
  const [customerGSTIN, setCustomerGSTIN] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('');
  const [taxableAmount, setTaxableAmount] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [igst, setIgst] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [activeField, setActiveField] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`);
        if (!res.ok) throw new Error('Failed to load invoice details');
        const data: Invoice = await res.json();
        setInvoice(data);
        
        // Populate form states
        setInvoiceNumber(data.invoiceNumber);
        setDate(data.date);
        setVendorName(data.vendorName);
        setVendorGSTIN(data.vendorGSTIN);
        setCustomerGSTIN(data.customerGSTIN || '27AAALC1234D1Z0');
        setPlaceOfSupply(data.placeOfSupply);
        setTaxableAmount(data.taxableAmount);
        setCgst(data.cgst);
        setSgst(data.sgst);
        setIgst(data.igst);
        setTotalAmount(data.totalAmount);
        setLineItems(data.lineItems || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  // Handle live calculation of taxes when taxable value or state matches change
  const handleTaxableAmountChange = (val: number) => {
    setTaxableAmount(val);
    recalculateTaxes(val, placeOfSupply, lineItems);
  };

  const handlePlaceOfSupplyChange = (pos: string) => {
    setPlaceOfSupply(pos);
    recalculateTaxes(taxableAmount, pos, lineItems);
  };

  const recalculateTaxes = (taxableAmt: number, pos: string, items: LineItem[]) => {
    const isInterstate = !pos.includes('27') && !pos.toLowerCase().includes('maharashtra');
    const computedTaxable = items.length > 0 ? items.reduce((acc, item) => acc + item.amount, 0) : taxableAmt;
    
    if (items.length > 0) {
      setTaxableAmount(computedTaxable);
    }
    
    if (isInterstate) {
      const computedIgst = Math.round(computedTaxable * 0.18 * 100) / 100;
      setIgst(computedIgst);
      setCgst(0);
      setSgst(0);
      setTotalAmount(computedTaxable + computedIgst);
    } else {
      const computedCgst = Math.round(computedTaxable * 0.09 * 100) / 100;
      const computedSgst = Math.round(computedTaxable * 0.09 * 100) / 100;
      setCgst(computedCgst);
      setSgst(computedSgst);
      setIgst(0);
      setTotalAmount(computedTaxable + computedCgst + computedSgst);
    }
  };

  const updateLineItem = (index: number, key: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [key]: value };
    
    if (key === 'qty' || key === 'rate') {
      const qty = key === 'qty' ? Number(value) : item.qty;
      const rate = key === 'rate' ? Number(value) : item.rate;
      item.amount = Math.round(qty * rate * 100) / 100;
    } else if (key === 'amount') {
      item.amount = Number(value);
    }
    
    updated[index] = item;
    setLineItems(updated);
    
    // Auto recalculate overall totals
    const sumTaxable = updated.reduce((acc, i) => acc + i.amount, 0);
    setTaxableAmount(sumTaxable);
    recalculateTaxes(sumTaxable, placeOfSupply, updated);
  };

  const addLineItem = () => {
    const newItem: LineItem = { description: 'New Chargeable Item', hsn: '998311', qty: 1, rate: 0, amount: 0 };
    const updated = [...lineItems, newItem];
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    const updated = lineItems.filter((_, i) => i !== index);
    setLineItems(updated);
    const sumTaxable = updated.reduce((acc, i) => acc + i.amount, 0);
    setTaxableAmount(sumTaxable);
    recalculateTaxes(sumTaxable, placeOfSupply, updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        invoiceNumber,
        date,
        vendorName,
        vendorGSTIN,
        customerGSTIN,
        placeOfSupply,
        taxableAmount,
        cgst,
        sgst,
        igst,
        totalAmount,
        lineItems
      };

      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save manual overrides');
      
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="validation-hub-overlay" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden animate-fade-in border border-slate-100">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-lg tracking-tight">OCR Audit & Validation Workbench</h3>
              <p className="text-xs text-slate-300">Compare OCR extracted metadata against physical invoice details in split-view</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-colors focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Panels */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 bg-slate-50">
          {error && (
            <div className="absolute top-16 left-0 right-0 bg-rose-600 text-white px-6 py-2 flex items-center gap-2 z-10 text-sm animate-pulse">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex-1 flex items-center justify-center bg-white text-slate-500">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                <p className="font-sans text-sm font-medium">Loading ledger records & audit logs...</p>
              </div>
            </div>
          ) : (
            <>
              {/* LEFT: ORIGINAL INVOICE VISUAL REPRESENTATION (STREET MAP & BOUNDING BOX LOOK) */}
              <div className="w-full lg:w-1/2 p-6 overflow-y-auto flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200">
                <div 
                  className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 w-full max-w-lg aspect-[1/1.4] relative overflow-hidden flex flex-col justify-between"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {/* Visual Watermark background representing scanned document */}
                  <div className="absolute inset-0 bg-radial-gradient from-slate-50/20 to-transparent pointer-events-none" />
                  
                  <div>
                    {/* Invoice Top Row */}
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-6">
                      <div>
                        {/* Vendor Bounding Box */}
                        <div 
                          className={`p-1 rounded transition-colors cursor-pointer ${activeField === 'vendorName' ? 'bg-amber-50 border-2 border-amber-300' : 'hover:bg-slate-50'}`}
                          onClick={() => setActiveField('vendorName')}
                        >
                          <h4 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{vendorName || 'VENDOR NAME'}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">Scanned Trading Name</p>
                        </div>
 
                        {/* GSTIN Bounding Box */}
                        <div 
                          className={`p-1 rounded mt-2 transition-colors cursor-pointer ${activeField === 'vendorGSTIN' ? 'bg-amber-50 border-2 border-amber-300' : 'hover:bg-slate-50'}`}
                          onClick={() => setActiveField('vendorGSTIN')}
                        >
                          <p className="font-mono text-xs text-slate-600 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded inline-block">
                            GSTIN: {vendorGSTIN || 'MISSING'}
                          </p>
                        </div>
                      </div>
 
                      <div className="text-right">
                        <span className="text-xs font-bold bg-slate-50 border border-slate-100 text-slate-800 px-2.5 py-1 rounded tracking-widest uppercase">Tax Invoice</span>
                        
                        {/* Invoice Number Bounding Box */}
                        <div 
                          className={`p-1 rounded mt-3 transition-colors cursor-pointer ${activeField === 'invoiceNumber' ? 'bg-amber-50 border-2 border-amber-300' : 'hover:bg-slate-50'}`}
                          onClick={() => setActiveField('invoiceNumber')}
                        >
                          <p className="text-xs text-slate-500 font-medium">Invoice Number</p>
                          <p className="text-sm font-bold text-slate-900 font-mono">{invoiceNumber}</p>
                        </div>
 
                        {/* Date Bounding Box */}
                        <div 
                          className={`p-1 rounded mt-2 transition-colors cursor-pointer ${activeField === 'date' ? 'bg-amber-50 border-2 border-amber-300' : 'hover:bg-slate-50'}`}
                          onClick={() => setActiveField('date')}
                        >
                          <p className="text-xs text-slate-500 font-medium">Dated</p>
                          <p className="text-xs font-bold text-slate-800">{date}</p>
                        </div>
                      </div>
                    </div>
 
                    {/* Bill To & POS Row */}
                    <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                      <div className="border border-dashed border-slate-200 p-2.5 rounded">
                        <p className="text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Recipient (Bill To)</p>
                        <p className="font-bold text-slate-800">Precision Ledger HQ</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">Corporate Finance Hub, BKC, Mumbai</p>
                        <p className="font-mono text-[11px] text-slate-600 mt-1">GSTIN: {customerGSTIN}</p>
                      </div>
 
                      <div 
                        className={`border border-dashed p-2.5 rounded transition-colors cursor-pointer ${activeField === 'placeOfSupply' ? 'bg-amber-50 border-amber-300 border-2' : 'border-slate-200 hover:bg-slate-50'}`}
                        onClick={() => setActiveField('placeOfSupply')}
                      >
                        <p className="text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Place of Supply (POS)</p>
                        <p className="font-bold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                          {placeOfSupply || 'Not Defined'}
                        </p>
                        <p className="text-slate-500 text-[10px] mt-1">First 2 digit state identification matches supply terminal.</p>
                      </div>
                    </div>
 
                    {/* Product Line items list scan */}
                    <div className="mb-6">
                      <div className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1.5 px-2 flex justify-between rounded">
                        <span>Description</span>
                        <span>Amount (INR)</span>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs font-sans mt-1">
                        {lineItems.length === 0 ? (
                          <div className="py-2 text-center text-slate-400 italic">No line items mapped.</div>
                        ) : (
                          lineItems.map((item, idx) => (
                            <div key={idx} className="py-2 px-1 flex justify-between items-center hover:bg-slate-50 rounded">
                              <div>
                                <p className="font-bold text-slate-800">{item.description}</p>
                                <p className="text-slate-400 text-[10px]">HSN: {item.hsn} | Qty: {item.qty} x ₹{item.rate}</p>
                              </div>
                              <span className="font-bold text-slate-900 font-mono">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
 
                  {/* Totals */}
                  <div className="border-t border-slate-100 pt-4 text-xs font-sans">
                    <div className="space-y-1.5 max-w-xs ml-auto">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal (Taxable):</span>
                        <span className="font-mono">₹{taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      {cgst > 0 && (
                        <div className="flex justify-between text-slate-500">
                          <span>CGST (9%):</span>
                          <span className="font-mono">₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {sgst > 0 && (
                        <div className="flex justify-between text-slate-500">
                          <span>SGST (9%):</span>
                          <span className="font-mono">₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {igst > 0 && (
                        <div className="flex justify-between text-slate-500">
                          <span>IGST (18%):</span>
                          <span className="font-mono">₹{igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-sm text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-dashed border-slate-200">
                        <span>Grand Total:</span>
                        <span className="font-mono text-indigo-600">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
 
                    <div className="mt-4 flex justify-between items-center text-[10px] text-slate-400">
                      <span>OCR Engine: {invoice?.ocrProvider || 'OmniVision'}</span>
                      <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">Scanned Confidence: {invoice?.confidence}%</span>
                    </div>
                  </div>        </div>
                </div>
                      {/* RIGHT: EDITABLE CORRECTION FORM */}
              <div className="w-full lg:w-1/2 p-6 overflow-y-auto bg-white flex flex-col h-full border-t lg:border-t-0 border-slate-200">
                <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        Audit Corrections Workbench
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">Modify highlighted field data to override OCR mistakes and run automated tax re-audits.</p>
                    </div>
 
                    {/* Standard Invoice Fields Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Invoice Number */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Invoice Number</label>
                        <input 
                          type="text" 
                          value={invoiceNumber}
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                          onFocus={() => setActiveField('invoiceNumber')}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-semibold font-mono focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all"
                          required
                        />
                      </div>
 
                      {/* Invoice Date */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Invoice Date</label>
                        <input 
                          type="date" 
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          onFocus={() => setActiveField('date')}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all"
                          required
                        />
                      </div>
 
                      {/* Vendor Trading Name */}
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Vendor Trading Name</label>
                        <input 
                          type="text" 
                          value={vendorName}
                          onChange={(e) => setVendorName(e.target.value)}
                          onFocus={() => setActiveField('vendorName')}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-950 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all"
                          required
                        />
                      </div>
 
                      {/* Vendor GSTIN */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Vendor GSTIN (15-char)</label>
                        <input 
                          type="text" 
                          value={vendorGSTIN}
                          onChange={(e) => setVendorGSTIN(e.target.value.toUpperCase())}
                          onFocus={() => setActiveField('vendorGSTIN')}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-semibold font-mono uppercase focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all"
                          placeholder="e.g. 27AADCA2230M1Z2"
                        />
                      </div>
 
                      {/* Place of Supply */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Place of Supply (POS)</label>
                        <select
                          value={placeOfSupply}
                          onChange={(e) => handlePlaceOfSupplyChange(e.target.value)}
                          onFocus={() => setActiveField('placeOfSupply')}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-semibold bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                        >
                          <option value="">Select supply terminal state</option>
                          {Object.entries(STATE_CODES).map(([code, name]) => (
                            <option key={code} value={`${name} (${code})`}>
                              {name} ({code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
 
                    {/* Dynamic Line Items Editor */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Line Charges & HSN Codes</label>
                        <button 
                          type="button"
                          onClick={addLineItem}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 focus:outline-none cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Line
                        </button>
                      </div>
 
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {lineItems.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 items-center">
                            <div className="col-span-4">
                              <input 
                                type="text"
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input 
                                type="text"
                                placeholder="HSN"
                                value={item.hsn}
                                onChange={(e) => updateLineItem(idx, 'hsn', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="col-span-1.5">
                              <input 
                                type="number"
                                placeholder="Qty"
                                value={item.qty}
                                onChange={(e) => updateLineItem(idx, 'qty', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center focus:outline-none focus:border-indigo-500"
                                required
                              />
                            </div>
                            <div className="col-span-2.5">
                              <input 
                                type="number"
                                placeholder="Rate"
                                value={item.rate}
                                onChange={(e) => updateLineItem(idx, 'rate', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-mono focus:outline-none focus:border-indigo-500"
                                required
                              />
                            </div>
                            <div className="col-span-2 flex items-center gap-1.5 justify-end">
                              <span className="text-xs font-bold font-mono text-slate-700">₹{item.amount}</span>
                              <button 
                                type="button"
                                onClick={() => removeLineItem(idx)}
                                className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
 
                    {/* Calculations review card */}
                    <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 grid grid-cols-3 gap-4 text-xs font-sans">
                      <div>
                        <span className="text-slate-500 font-medium">Subtotal (Taxable Value)</span>
                        <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">₹{taxableAmount}</div>
                      </div>
 
                      {igst > 0 ? (
                        <div>
                          <span className="text-slate-500 font-medium">IGST (Interstate 18%)</span>
                          <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">₹{igst}</div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <span className="text-slate-500 font-medium">CGST (Intrastate 9%)</span>
                            <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">₹{cgst}</div>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">SGST (Intrastate 9%)</span>
                            <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">₹{sgst}</div>
                          </div>
                        </>
                      )}
 
                      <div className="col-span-3 border-t border-indigo-100 pt-2 flex justify-between items-center font-bold">
                        <span className="text-indigo-800">Grand Total Amount (Including taxes):</span>
                        <span className="text-base text-indigo-950 font-mono">₹{totalAmount}</span>
                      </div>
                    </div>
                  </div>
 
                  {/* Submit override controls */}
                  <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6 bg-white sticky bottom-0">
                    <button 
                      type="button" 
                      onClick={onClose}
                      className="px-5 py-2 bg-slate-100 text-slate-700 font-sans text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-sm font-semibold rounded-lg shadow-lg shadow-indigo-100/50 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer focus:outline-none"
                    >
                      {saving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Commit Audit Corrections
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
