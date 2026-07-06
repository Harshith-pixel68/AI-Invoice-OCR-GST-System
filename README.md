# AI Invoice OCR & GST System

An AI-powered GST invoice processing platform that automatically extracts invoice data using OCR, validates GST information, detects compliance issues, and generates audit-ready reports.

## Features

- AI-powered invoice OCR
- Automatic GSTIN extraction
- Vendor detection
- Line item extraction
- HSN/SAC code detection
- CGST / SGST / IGST calculation
- GST validation dashboard
- OCR confidence scoring
- Duplicate invoice detection
- Vendor management
- Audit reports
- CSV export
- Manual correction workbench
- Enterprise dashboard
- OCR fallback engine for failed AI extraction

## Tech Stack

- React
- TypeScript
- Vite
- Express.js
- Google Gemini API
- Google Vision OCR
- Node.js

## Screenshots

(Add screenshots here)

## Live Demo

https://YOUR-PUBLISHED-URL

## Installation

```bash
npm install
```

Configure your API key

```env
GEMINI_API_KEY=YOUR_API_KEY
```

Run the project

```bash
npm run dev
```

## Project Structure

```
src/
 ├── components/
 ├── pages/
 ├── server/
 ├── services/
 ├── ocr/
 ├── validation/
 └── export/
```

## Current Capabilities

- Invoice OCR
- AI field extraction
- GST validation
- Vendor management
- Audit queue
- Reports dashboard
- CSV export
- Manual verification workflow

## Future Roadmap

- User authentication
- GST API integration
- Multi-user workspace
- Subscription plans
- Payment gateway
- Bulk invoice processing
- PDF export
- Cloud database
- Analytics dashboard
- Mobile responsive UI

## License

MIT License
