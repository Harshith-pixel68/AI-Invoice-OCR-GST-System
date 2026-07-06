export interface IOcrProvider {
  /**
   * Name of the OCR provider (e.g. 'Tesseract Engine', 'Google Document AI', etc.)
   */
  getProviderName(): string;

  /**
   * Extract raw text from base64 representation of image or PDF document
   */
  extractText(base64Data: string, mimeType: string): Promise<string>;
}
