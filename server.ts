import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Import Clean Architecture layers
import { defaultStorageProvider } from './src/server/infrastructure/JsonFileStorageProvider.js';
import { JsonInvoiceRepository } from './src/server/infrastructure/JsonInvoiceRepository.js';
import { JsonVendorRepository } from './src/server/infrastructure/JsonVendorRepository.js';
import { GoogleVisionOcrProvider } from './src/server/infrastructure/GoogleVisionOcrProvider.js';
import { TesseractOcrProvider } from './src/server/infrastructure/TesseractOcrProvider.js';
import { GeminiAiExtractorProvider } from './src/server/infrastructure/GeminiAiExtractorProvider.js';
import { InvoiceService } from './src/server/core/services/InvoiceService.js';

// Load environmental variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload size limits for base64 file uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Initialize Core and Infrastructure dependencies
  const storageProvider = defaultStorageProvider;
  const invoiceRepo = new JsonInvoiceRepository(storageProvider);
  const vendorRepo = new JsonVendorRepository(storageProvider);
  
  const googleVisionOcr = new GoogleVisionOcrProvider();
  const tesseractOcr = new TesseractOcrProvider();
  
  const aiExtractor = new GeminiAiExtractorProvider();

  const invoiceService = new InvoiceService(
    invoiceRepo,
    vendorRepo,
    [googleVisionOcr, tesseractOcr],
    aiExtractor
  );

  console.log('[System] Clean Architecture components successfully wired.');

  // --- REST API ENDPOINTS (Routing via Services) ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get KPI Summary Dashboard statistics
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await invoiceService.getStats();
      res.json(stats);
    } catch (error: any) {
      console.error('[API] Failed to fetch statistics:', error);
      res.status(500).json({ error: 'Failed to retrieve stats', details: error.message });
    }
  });

  // Get Invoices List with filtering & pagination
  app.get('/api/invoices', async (req, res) => {
    try {
      const { search, status, validationStatus, page = '1', limit = '10' } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const result = await invoiceService.getAll(
        search as string,
        status as string,
        validationStatus as string,
        pageNum,
        limitNum
      );
      res.json(result);
    } catch (error: any) {
      console.error('[API] Failed to query invoices:', error);
      res.status(500).json({ error: 'Failed to retrieve invoices', details: error.message });
    }
  });

  // Get an Individual Invoice by ID
  app.get('/api/invoices/:id', async (req, res) => {
    try {
      const invoice = await invoiceService.getById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      res.json(invoice);
    } catch (error: any) {
      console.error(`[API] Failed to retrieve invoice ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to retrieve invoice', details: error.message });
    }
  });

  // Create/Upload a new Invoice & trigger OCR / AI processing
  app.post('/api/invoices/upload', async (req, res) => {
    try {
      const { fileName, fileType, fileData, ocrProvider = 'Google Document AI', runAI = true } = req.body;

      if (!fileData) {
        return res.status(400).json({ error: 'Missing base64 fileData' });
      }

      console.log(`[API] Upload request received: name=${fileName}, provider=${ocrProvider}`);

      // Process upload in the service container
      const invoice = await invoiceService.uploadInvoice(
        fileName,
        fileType,
        fileData,
        ocrProvider,
        runAI
      );

      res.status(201).json(invoice);
    } catch (error: any) {
      console.error('[API] Invoice upload processing failed:', error);
      res.status(500).json({ error: 'Invoice processing failed', details: error.message });
    }
  });

  // Update an existing Invoice (manual overrides/approvals)
  app.put('/api/invoices/:id', async (req, res) => {
    try {
      const updatedInvoice = await invoiceService.updateInvoice(req.params.id, req.body);
      res.json(updatedInvoice);
    } catch (error: any) {
      console.error(`[API] Invoice manual correction failed for ${req.params.id}:`, error);
      res.status(500).json({ error: 'Invoice update failed', details: error.message });
    }
  });

  // Get active Vendor Directory list
  app.get('/api/vendors', async (req, res) => {
    try {
      const vendors = await invoiceService.getVendors();
      res.json(vendors);
    } catch (error: any) {
      console.error('[API] Failed to fetch vendor list:', error);
      res.status(500).json({ error: 'Failed to retrieve vendors', details: error.message });
    }
  });

  // Export filtered invoices to pristine Excel-compatible CSV format
  app.get('/api/export', async (req, res) => {
    try {
      const { status, validationStatus } = req.query;
      const { data: exportInvoices } = await invoiceService.getAll(
        undefined,
        status as string,
        validationStatus as string,
        1,
        10000 // Large limit to export all
      );

      const csvHeaders = [
        'Invoice ID',
        'Invoice Number',
        'Invoice Date',
        'Vendor Name',
        'Vendor GSTIN',
        'Customer GSTIN',
        'Place of Supply',
        'Taxable Amount',
        'CGST (9%)',
        'SGST (9%)',
        'IGST (18%)',
        'Total Amount',
        'Processing Status',
        'GST Valid Status',
        'Audit Exception Reason',
        'Confidence %',
        'OCR Provider',
        'Processed Timestamp'
      ];

      const rows = exportInvoices.map(inv => [
        inv.id,
        `"${inv.invoiceNumber}"`,
        inv.date,
        `"${inv.vendorName}"`,
        `"${inv.vendorGSTIN || 'N/A'}"`,
        `"${inv.customerGSTIN || 'N/A'}"`,
        `"${inv.placeOfSupply}"`,
        inv.taxableAmount,
        inv.cgst,
        inv.sgst,
        inv.igst,
        inv.totalAmount,
        inv.status,
        inv.validationStatus,
        `"${inv.validationReason}"`,
        inv.confidence,
        `"${inv.ocrProvider}"`,
        inv.uploadedAt
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...rows.map(e => e.join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=logiocr_invoices_export.csv');
      res.status(200).send(csvContent);
    } catch (error: any) {
      console.error('[API] CSV Export failed:', error);
      res.status(500).json({ error: 'Export failed', details: error.message });
    }
  });

  // Reset Database back to factory defaults
  app.post('/api/reset', async (req, res) => {
    try {
      const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
      if (fs.existsSync(DB_PATH)) {
        await fs.promises.unlink(DB_PATH);
      }
      
      storageProvider.clearCache();
      
      // Re-seed database
      await invoiceRepo.getAll();
      await vendorRepo.getAll();
      
      res.json({ success: true, message: 'Database reset to factory mock data successfully!' });
    } catch (e: any) {
      console.error('[API] Reset failed:', e);
      res.status(500).json({ error: 'Reset failed', details: e.message });
    }
  });

  // --- VITE DEV MIDDLEWARE / STATIC FILES SERVING ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to port 3000 and host 0.0.0.0
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Enterprise LogiOCR AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
