import { Invoice } from '../models.js';

export interface IAiExtractorProvider {
  /**
   * Name of the AI Provider (e.g. 'Gemini 3.5 Flash', 'OpenAI GPT-4o', etc.)
   */
  getProviderName(): string;

  /**
   * Extract invoice fields using AI from the raw extracted OCR text
   */
  extractFields(ocrText: string): Promise<Partial<Invoice>>;

  /**
   * Direct multimodal image extraction if the LLM supports reading files directly (e.g. Gemini)
   */
  extractDirectlyFromImage(base64Data: string, mimeType: string): Promise<Partial<Invoice>>;
}
