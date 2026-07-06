import { Invoice, Vendor, STATE_CODES } from '../core/models.js';

export const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv_1',
    invoiceNumber: 'INV-2023-892',
    date: '2026-06-28',
    vendorName: 'Acme Corp Logistics',
    vendorGSTIN: '27AADCA2230M1Z2',
    customerGSTIN: '27AAALC1234D1Z0',
    placeOfSupply: 'Maharashtra (27)',
    taxableAmount: 154500.00,
    cgst: 13905.00,
    sgst: 13905.00,
    igst: 0,
    totalAmount: 182310.00,
    status: 'processed',
    validationStatus: 'pass',
    validationReason: '-',
    confidence: 99.4,
    ocrProvider: 'Google Document AI',
    uploadedAt: '2026-06-28T10:15:00Z',
    lineItems: [
      { description: 'Heavy Machinery Freight Charges', hsn: '996511', qty: 1, rate: 120000.00, amount: 120000.00 },
      { description: 'Warehousing & Handling Fees', hsn: '996729', qty: 1, rate: 34500.00, amount: 34500.00 }
    ]
  },
  {
    id: 'inv_2',
    invoiceNumber: 'GTS-441-A',
    date: '2026-06-30',
    vendorName: 'Global Tech Supplies',
    vendorGSTIN: '07BBEPG8932L1Z9',
    customerGSTIN: '27AAALC1234D1Z0',
    placeOfSupply: 'Delhi (07)',
    taxableAmount: 45000.00,
    cgst: 0,
    sgst: 0,
    igst: 8100.00,
    totalAmount: 53100.00,
    status: 'pending_review',
    validationStatus: 'fail',
    validationReason: 'Invalid Format (Checksum)',
    confidence: 87.2,
    ocrProvider: 'Tesseract Engine',
    uploadedAt: '2026-06-30T14:22:12Z',
    lineItems: [
      { description: 'Standard Keyboard & Mouse Bundles', hsn: '847160', qty: 30, rate: 1500.00, amount: 45000.00 }
    ]
  },
  {
    id: 'inv_3',
    invoiceNumber: 'RT-99210',
    date: '2026-07-01',
    vendorName: 'Rapid Transport Pvt Ltd',
    vendorGSTIN: '29AAACR1234F1Z5',
    customerGSTIN: '27AAALC1234D1Z0',
    placeOfSupply: 'Maharashtra (27)',
    taxableAmount: 89000.00,
    cgst: 8010.00,
    sgst: 8010.00,
    igst: 0,
    totalAmount: 105020.00,
    status: 'pending_review',
    validationStatus: 'warning',
    validationReason: 'State Code (29) mismatches POS',
    confidence: 96.5,
    ocrProvider: 'OmniVision AI',
    uploadedAt: '2026-07-01T09:44:55Z',
    lineItems: [
      { description: 'Inter-state Logistics Shipping services', hsn: '996511', qty: 1, rate: 89000.00, amount: 89000.00 }
    ]
  },
  {
    id: 'inv_4',
    invoiceNumber: 'OED-22-11',
    date: '2026-07-02',
    vendorName: 'Office Essentials Desk',
    vendorGSTIN: '',
    customerGSTIN: '27AAALC1234D1Z0',
    placeOfSupply: 'Delhi (07)',
    taxableAmount: 12400.00,
    cgst: 0,
    sgst: 0,
    igst: 2232.00,
    totalAmount: 14632.00,
    status: 'pending_review',
    validationStatus: 'fail',
    validationReason: 'GSTIN not present on invoice',
    confidence: 62.1,
    ocrProvider: 'Google Document AI',
    uploadedAt: '2026-07-02T11:05:10Z',
    lineItems: [
      { description: 'Premium Executive Chairs', hsn: '940310', qty: 2, rate: 6200.00, amount: 12400.00 }
    ]
  },
  {
    id: 'inv_5',
    invoiceNumber: 'INV-APX-001',
    date: '2026-07-04',
    vendorName: 'Apex Manufacturing',
    vendorGSTIN: '24CCDPM9876Q1Z3',
    customerGSTIN: '27AAALC1234D1Z0',
    placeOfSupply: 'Gujarat (24)',
    taxableAmount: 340000.00,
    cgst: 0,
    sgst: 0,
    igst: 61200.00,
    totalAmount: 401200.00,
    status: 'processed',
    validationStatus: 'pass',
    validationReason: '-',
    confidence: 98.9,
    ocrProvider: 'Google Document AI',
    uploadedAt: '2026-07-04T16:50:00Z',
    lineItems: [
      { description: 'Custom Molded Polyethylene Components', hsn: '392690', qty: 1000, rate: 340.00, amount: 340000.00 }
    ]
  }
];

export const VENDOR_NAMES = [
  { name: 'Paramount Papers', gstin: '09AAACP4321D1Z5', state: 'Uttar Pradesh (09)' },
  { name: 'Super Gas Corporation', gstin: '27AABCS1234E1Z1', state: 'Maharashtra (27)' },
  { name: 'Express Courier & Cargo', gstin: '33AABCE5544R1Z0', state: 'Tamil Nadu (33)' },
  { name: 'Bright Ideas Advertising', gstin: '19AAACB1122J1Z8', state: 'West Bengal (19)' },
  { name: 'Kodiak Metal Works', gstin: '24AAACK8899K1Z4', state: 'Gujarat (24)' },
  { name: 'Horizon Consultancy Group', gstin: '36AAACH9999M1Z3', state: 'Telangana (36)' },
  { name: 'Delta Telecom Services', gstin: '07AAACD7777H1Z5', state: 'Delhi (07)' },
];

export function generateMockInvoices(): Invoice[] {
  const invoices = [...DEFAULT_INVOICES];
  
  for (let i = 6; i <= 50; i++) {
    const vendorIdx = i % VENDOR_NAMES.length;
    const vendor = VENDOR_NAMES[vendorIdx];
    
    const baseAmt = Math.floor(Math.random() * 150000) + 5000;
    const igstRate = 0.18;
    const cgstRate = 0.09;
    const sgstRate = 0.09;
    
    const isInterstate = !vendor.state.includes('27');
    const cgst = isInterstate ? 0 : Math.round(baseAmt * cgstRate * 100) / 100;
    const sgst = isInterstate ? 0 : Math.round(baseAmt * sgstRate * 100) / 100;
    const igst = isInterstate ? Math.round(baseAmt * igstRate * 100) / 100 : 0;
    const total = baseAmt + cgst + sgst + igst;
    
    const confidence = parseFloat((Math.random() * 20 + 80).toFixed(1));
    const providers = ['Google Document AI', 'Tesseract Engine', 'OmniVision AI'];
    const provider = providers[i % providers.length];
    
    let status: 'processed' | 'pending_review' | 'failed' = 'processed';
    let valStatus: 'pass' | 'fail' | 'warning' = 'pass';
    let reason = '-';
    
    if (i % 12 === 0) {
      status = 'pending_review';
      valStatus = 'warning';
      reason = `State Code (${vendor.gstin.substring(0,2)}) mismatches POS (Maharashtra (27))`;
    } else if (i % 15 === 0) {
      status = 'pending_review';
      valStatus = 'fail';
      reason = 'Invalid Format (Checksum)';
    } else if (i % 25 === 0) {
      status = 'pending_review';
      valStatus = 'fail';
      reason = 'GSTIN not present on invoice';
    }
    
    const dateOffset = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - dateOffset);
    const dateStr = date.toISOString().split('T')[0];
    
    invoices.push({
      id: `inv_${i}`,
      invoiceNumber: `INV-2026-${1000 + i}`,
      date: dateStr,
      vendorName: i % 18 === 0 && i !== 0 ? 'Office Essentials Desk' : vendor.name,
      vendorGSTIN: i % 18 === 0 && i !== 0 ? '' : (i % 15 === 0 ? vendor.gstin.substring(0, 14) + 'X' : vendor.gstin),
      customerGSTIN: '27AAALC1234D1Z0',
      placeOfSupply: i % 12 === 0 ? 'Maharashtra (27)' : vendor.state,
      taxableAmount: baseAmt,
      cgst,
      sgst,
      igst,
      totalAmount: total,
      status,
      validationStatus: i % 18 === 0 && i !== 0 ? 'fail' : valStatus,
      validationReason: i % 18 === 0 && i !== 0 ? 'GSTIN not present on invoice' : reason,
      confidence,
      ocrProvider: provider,
      uploadedAt: new Date(date.getTime() - 2 * 3600 * 1000).toISOString(),
      lineItems: [
        { description: 'Business Ops Service Supply', hsn: '998311', qty: 1, rate: baseAmt, amount: baseAmt }
      ]
    });
  }
  
  return invoices;
}

export function recalculateVendors(invoices: Invoice[]): Vendor[] {
  const vendorMap: { [gstin: string]: Vendor } = {};
  
  DEFAULT_INVOICES.forEach(inv => {
    if (inv.vendorGSTIN) {
      vendorMap[inv.vendorGSTIN] = {
        gstin: inv.vendorGSTIN,
        name: inv.vendorName,
        stateCode: inv.vendorGSTIN.substring(0, 2),
        address: `${inv.vendorName} Corporate Park, Plot No ${Math.floor(Math.random() * 100) + 1}, Sector 11, ${STATE_CODES[inv.vendorGSTIN.substring(0, 2)] || 'India'}`,
        invoiceCount: 0,
        totalSpend: 0,
        lastActive: inv.date,
      };
    }
  });
  
  invoices.forEach(inv => {
    const gstin = inv.vendorGSTIN || 'MISSING_GSTIN';
    if (gstin === 'MISSING_GSTIN') return;
    
    if (!vendorMap[gstin]) {
      vendorMap[gstin] = {
        gstin,
        name: inv.vendorName,
        stateCode: gstin.substring(0, 2),
        address: `${inv.vendorName} Corporate Park, Plot No ${Math.floor(Math.random() * 100) + 1}, Sector 11, ${STATE_CODES[gstin.substring(0, 2)] || 'India'}`,
        invoiceCount: 0,
        totalSpend: 0,
        lastActive: inv.date,
      };
    }
    
    const v = vendorMap[gstin];
    v.invoiceCount += 1;
    v.totalSpend += inv.totalAmount;
    
    if (new Date(inv.date).getTime() > new Date(v.lastActive).getTime()) {
      v.lastActive = inv.date;
    }
  });
  
  return Object.values(vendorMap);
}
