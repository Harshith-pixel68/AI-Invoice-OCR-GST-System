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

export const STATE_CODES: { [key: string]: string } = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
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
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
};
