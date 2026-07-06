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

<img width="1920" height="1032" alt="Screenshot 2026-07-06 235218" src="https://github.com/user-attachments/assets/12e93ff6-3999-4003-87b7-4d061ca8264a" /><img width="1920" height="1032" alt="Screenshot 2026-07-06 235210" src="https://github.com/user-attachments/assets/4b8b302c-e28f-4a4a-a044-982a6efbb6b3" />
<img width="1920" height="1032" alt="Screenshot 2026-07-06 235203" src="https://github.com/user-attachments/assets/6236d000-a695-4ed4-8630-6cf243cc6603" />
<img width="1920" height="1032" alt="Screenshot 2026-07-06 235157" src="https://github.com/user-attachments/assets/f51a3210-72b1-4dc0-9abe-c4b90342baa1" />



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
