export interface LineItem {
  description: string;
  hsn: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  vendorName: string;
  vendorGSTIN: string;
  customerGSTIN: string;
  placeOfSupply: string;
  taxableAmount: number | null;
  cgst: number | null;
  sgst: number | null;
  igst: number | null;
  totalAmount: number | null;
  status: 'processed' | 'pending_review' | 'failed';
  validationStatus: 'pass' | 'fail' | 'warning';
  validationReason: string;
  confidence: number;
  ocrProvider: string;
  lineItems: LineItem[];
  uploadedAt: string;
  invoiceType?: string;
}

export interface Vendor {
  gstin: string;
  name: string;
  stateCode: string;
  address: string;
  invoiceCount: number;
  totalSpend: number;
  lastActive: string;
}

export interface DBStats {
  validGST: number;
  invalidGST: number;
  missingGST: number;
  stateMismatch: number;
  duplicateGST: number;
  checksumFail: number;
  totalSpend: number;
  totalInvoices: number;
  processedInvoices: number;
  pendingReviewInvoices: number;
  failedInvoices: number;
  averageConfidence: number;
}

export type TabType = 
  | 'dashboard'
  | 'upload'
  | 'processed'
  | 'pending_review'
  | 'gst_validation'
  | 'vendors'
  | 'reports'
  | 'export'
  | 'settings';
