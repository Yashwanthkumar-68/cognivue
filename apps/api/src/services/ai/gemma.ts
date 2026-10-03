/**
 * LearnLens Gemma 4 Multimodal Service Layer
 * Isolated service according to architectural specification.
 * Directly integrates with Google Gemma 4 models (e.g. google/gemma-4-31B-it).
 */
import { GemmaMultimodalExtraction } from '@learnlens/schemas';
import { GemmaProvider } from '@learnlens/ai-core';

export class GemmaService {
  private static providerInstance: GemmaProvider;

  static getProvider(): GemmaProvider {
    if (!this.providerInstance) {
      this.providerInstance = new GemmaProvider({
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMMA_MODEL || 'google/gemma-4-31B-it'
      });
    }
    return this.providerInstance;
  }

  static async analyzeMultimodalSource(source: {
    id: string;
    title: string;
    type: string;
    text?: string;
    mediaUrl?: string;
  }): Promise<GemmaMultimodalExtraction> {
    const provider = this.getProvider();
    return provider.extractMultimodalContent(source);
  }
}
