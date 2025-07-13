/**
 * 🤖 Client OpenAI pour Intégration IA
 * Interface simplifiée pour les modèles OpenAI et alternatives
 */

// Types pour les requêtes OpenAI
export interface OpenAIConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingRequest {
  model: string;
  input: string | string[];
  encoding_format?: 'float' | 'base64';
}

export interface EmbeddingResponse {
  object: string;
  data: {
    object: string;
    embedding: number[];
    index: number;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * 🔗 Client OpenAI avec support pour OpenRouter et autres alternatives
 */
export class OpenAIClient {
  private config: OpenAIConfig;
  private baseURL: string;

  constructor(config: OpenAIConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.REACT_APP_OPENAI_API_KEY || '',
      baseURL: config.baseURL || process.env.REACT_APP_OPENROUTER_API_URL || 'https://api.openai.com/v1',
      model: config.model || 'gpt-3.5-turbo',
      maxTokens: config.maxTokens || 1000,
      temperature: config.temperature || 0.7,
      ...config
    };

    this.baseURL = this.config.baseURL!;
  }

  /**
   * 💬 Génération de texte avec chat completion
   */
  async createChatCompletion(request: Partial<ChatCompletionRequest>): Promise<ChatCompletionResponse> {
    if (!request.messages || request.messages.length === 0) {
      throw new Error('Messages are required for chat completion');
    }

    const fullRequest: ChatCompletionRequest = {
      model: this.config.model!,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      messages: request.messages,
      ...request
    };

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...(this.baseURL.includes('openrouter.ai') && {
            'HTTP-Referer': window.location.origin,
            'X-Title': 'EduAI Enhanced'
          })
        },
        body: JSON.stringify(fullRequest)
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as ChatCompletionResponse;

    } catch (error) {
      console.error('❌ Erreur OpenAI Chat Completion:', error);
      throw error;
    }
  }

  /**
   * 🧮 Génération d'embeddings vectoriels
   */
  async createEmbedding(request: Partial<EmbeddingRequest>): Promise<EmbeddingResponse> {
    if (!request.input) {
      throw new Error('Input is required for embedding generation');
    }

    const fullRequest: EmbeddingRequest = {
      model: 'text-embedding-ada-002',
      encoding_format: 'float',
      input: request.input,
      ...request
    };

    try {
      const response = await fetch(`${this.baseURL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...(this.baseURL.includes('openrouter.ai') && {
            'HTTP-Referer': window.location.origin,
            'X-Title': 'EduAI Enhanced'
          })
        },
        body: JSON.stringify(fullRequest)
      });

      if (!response.ok) {
        throw new Error(`OpenAI Embedding error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as EmbeddingResponse;

    } catch (error) {
      console.error('❌ Erreur OpenAI Embedding:', error);
      throw error;
    }
  }

  /**
   * 🔧 Méthodes utilitaires
   */
  
  /**
   * Estimer le coût d'une requête
   */
  estimateCost(tokens: number, model: string = this.config.model!): number {
    // Prix approximatifs en USD pour 1000 tokens
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
      'text-embedding-ada-002': { input: 0.0001, output: 0.0001 }
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
    return (tokens / 1000) * modelPricing.input;
  }

  /**
   * Compter les tokens approximativement
   */
  estimateTokens(text: string): number {
    // Estimation approximative : 1 token ≈ 4 caractères en anglais
    return Math.ceil(text.length / 4);
  }

  /**
   * Valider la configuration
   */
  validateConfig(): boolean {
    if (!this.config.apiKey) {
      console.warn('⚠️ Clé API OpenAI manquante');
      return false;
    }

    if (!this.config.baseURL) {
      console.warn('⚠️ URL de base manquante');
      return false;
    }

    return true;
  }

  /**
   * Obtenir les informations de configuration (sans la clé API)
   */
  getConfigInfo() {
    return {
      baseURL: this.config.baseURL,
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      hasApiKey: !!this.config.apiKey
    };
  }

  /**
   * Mettre à jour la configuration
   */
  updateConfig(newConfig: Partial<OpenAIConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.baseURL = this.config.baseURL!;
  }
}

// Instance par défaut
export const openAIClient = new OpenAIClient();

// Export par défaut
export default openAIClient;
