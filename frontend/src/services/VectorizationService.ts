/**
 * 🧠 Système de Vectorisation et Embeddings Store
 * Retrieval-Augmented Generation (RAG) pour EduAI Enhanced
 */

import { openAIClient } from '../ai/openai-client';

// Types pour la vectorisation
export interface EmbeddingDocument {
  id: string;
  content: string;
  metadata: {
    type: 'lesson' | 'concept' | 'exercise' | 'explanation';
    subject: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    userId?: string;
    courseId?: string;
  };
  embedding?: number[];
  similarity?: number;
}

export interface VectorSearchOptions {
  limit?: number;
  threshold?: number;
  filter?: {
    type?: string[];
    subject?: string[];
    difficulty?: string[];
    tags?: string[];
    userId?: string;
  };
}

export interface VectorSearchResult {
  documents: EmbeddingDocument[];
  totalCount: number;
  searchTime: number;
  query: string;
}

/**
 * 🗄️ Embeddings Store avec indexation vectorielle
 */
export class EmbeddingsStore {
  private documents: Map<string, EmbeddingDocument> = new Map();
  private index: Map<string, number[]> = new Map();
  private isInitialized = false;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * 🚀 Initialiser le store
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🧠 Initialisation de l\'Embeddings Store...');
    await this.loadFromStorage();
    this.isInitialized = true;
    console.log(`✅ Store initialisé avec ${this.documents.size} documents`);
  }

  /**
   * ➕ Ajouter un document avec embedding
   */
  async addDocument(document: Omit<EmbeddingDocument, 'id' | 'embedding'>): Promise<string> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Générer l'embedding
      const embedding = await this.generateEmbedding(document.content);
      
      const fullDocument: EmbeddingDocument = {
        ...document,
        id,
        embedding,
      };

      // Stocker le document et son embedding
      this.documents.set(id, fullDocument);
      this.index.set(id, embedding);

      // Sauvegarder dans le stockage persistant
      await this.saveToStorage();

      console.log(`📄 Document ajouté: ${id}`);
      return id;

    } catch (error) {
      console.error('❌ Erreur ajout document:', error);
      throw error;
    }
  }

  /**
   * 📄 Ajouter plusieurs documents en batch
   */
  async addDocumentsBatch(documents: Omit<EmbeddingDocument, 'id' | 'embedding'>[]): Promise<string[]> {
    console.log(`📚 Ajout de ${documents.length} documents en batch...`);
    const ids: string[] = [];

    // Traiter par lots pour éviter la surcharge
    const batchSize = 5;
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (doc) => {
        try {
          return await this.addDocument(doc);
        } catch (error) {
          console.error('❌ Erreur dans le batch:', error);
          return null;
        }
      });

      const batchIds = await Promise.all(batchPromises);
      ids.push(...batchIds.filter(id => id !== null) as string[]);

      // Petite pause entre les batches pour éviter la limitation de taux
      if (i + batchSize < documents.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ ${ids.length}/${documents.length} documents ajoutés`);
    return ids;
  }

  /**
   * 🔍 Recherche vectorielle avec similarité
   */
  async search(query: string, options: VectorSearchOptions = {}): Promise<VectorSearchResult> {
    const startTime = Date.now();
    
    try {
      // Générer l'embedding de la requête
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Calculer la similarité avec tous les documents
      const similarities: Array<{ id: string; similarity: number; document: EmbeddingDocument }> = [];
      
      for (const [id, document] of this.documents) {
        if (!document.embedding) continue;

        // Appliquer les filtres
        if (!this.matchesFilter(document, options.filter)) continue;

        // Calculer la similarité cosinus
        const similarity = this.cosineSimilarity(queryEmbedding, document.embedding);
        
        if (similarity >= (options.threshold || 0.7)) {
          similarities.push({
            id,
            similarity,
            document: { ...document, similarity }
          });
        }
      }

      // Trier par similarité décroissante
      similarities.sort((a, b) => b.similarity - a.similarity);

      // Limiter les résultats
      const limit = options.limit || 10;
      const limitedResults = similarities.slice(0, limit);

      const searchTime = Date.now() - startTime;

      return {
        documents: limitedResults.map(r => r.document),
        totalCount: similarities.length,
        searchTime,
        query
      };

    } catch (error) {
      console.error('❌ Erreur recherche vectorielle:', error);
      throw error;
    }
  }

  /**
   * 🎯 Recherche de documents similaires à un document existant
   */
  async findSimilar(documentId: string, options: VectorSearchOptions = {}): Promise<VectorSearchResult> {
    const document = this.documents.get(documentId);
    if (!document || !document.embedding) {
      throw new Error(`Document ${documentId} non trouvé ou sans embedding`);
    }

    // Utiliser le contenu du document comme requête
    return this.search(document.content, {
      ...options,
      // Exclure le document original des résultats
      filter: {
        ...options.filter,
      }
    });
  }

  /**
   * 🔄 Mettre à jour un document
   */
  async updateDocument(id: string, updates: Partial<EmbeddingDocument>): Promise<void> {
    const document = this.documents.get(id);
    if (!document) {
      throw new Error(`Document ${id} non trouvé`);
    }

    const updatedDocument = { ...document, ...updates, updatedAt: new Date() };

    // Si le contenu a changé, régénérer l'embedding
    if (updates.content && updates.content !== document.content) {
      try {
        updatedDocument.embedding = await this.generateEmbedding(updates.content);
        this.index.set(id, updatedDocument.embedding);
      } catch (error) {
        console.error('❌ Erreur mise à jour embedding:', error);
        throw error;
      }
    }

    this.documents.set(id, updatedDocument);
    await this.saveToStorage();

    console.log(`📝 Document mis à jour: ${id}`);
  }

  /**
   * 🗑️ Supprimer un document
   */
  async deleteDocument(id: string): Promise<void> {
    if (!this.documents.has(id)) {
      throw new Error(`Document ${id} non trouvé`);
    }

    this.documents.delete(id);
    this.index.delete(id);
    await this.saveToStorage();

    console.log(`🗑️ Document supprimé: ${id}`);
  }

  /**
   * 📊 Obtenir des statistiques du store
   */
  getStats(): {
    totalDocuments: number;
    documentsByType: Record<string, number>;
    documentsBySubject: Record<string, number>;
    averageEmbeddingSize: number;
    storageSize: number;
  } {
    const stats = {
      totalDocuments: this.documents.size,
      documentsByType: {} as Record<string, number>,
      documentsBySubject: {} as Record<string, number>,
      averageEmbeddingSize: 0,
      storageSize: 0
    };

    let totalEmbeddingSize = 0;
    
    for (const doc of this.documents.values()) {
      // Compter par type
      stats.documentsByType[doc.metadata.type] = (stats.documentsByType[doc.metadata.type] || 0) + 1;
      
      // Compter par sujet
      stats.documentsBySubject[doc.metadata.subject] = (stats.documentsBySubject[doc.metadata.subject] || 0) + 1;
      
      // Taille des embeddings
      if (doc.embedding) {
        totalEmbeddingSize += doc.embedding.length;
      }
    }

    stats.averageEmbeddingSize = this.documents.size > 0 ? totalEmbeddingSize / this.documents.size : 0;
    
    // Estimation de la taille de stockage
    const dataString = JSON.stringify(Array.from(this.documents.values()));
    stats.storageSize = new Blob([dataString]).size;

    return stats;
  }

  /**
   * 🔧 Méthodes privées
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openAIClient.createEmbedding({
        model: 'text-embedding-ada-002',
        input: text.substring(0, 8000), // Limiter la taille du texte
      });

      return response.data[0].embedding;

    } catch (error) {
      console.error('❌ Erreur génération embedding:', error);
      throw error;
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Les vecteurs doivent avoir la même dimension');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  private matchesFilter(document: EmbeddingDocument, filter?: VectorSearchOptions['filter']): boolean {
    if (!filter) return true;

    if (filter.type && !filter.type.includes(document.metadata.type)) return false;
    if (filter.subject && !filter.subject.includes(document.metadata.subject)) return false;
    if (filter.difficulty && !filter.difficulty.includes(document.metadata.difficulty)) return false;
    if (filter.userId && document.metadata.userId !== filter.userId) return false;
    
    if (filter.tags && filter.tags.length > 0) {
      const hasMatchingTag = filter.tags.some(tag => document.metadata.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    return true;
  }

  private async saveToStorage(): Promise<void> {
    try {
      const data = {
        documents: Array.from(this.documents.entries()),
        index: Array.from(this.index.entries()),
        version: 1,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem('eduai_embeddings_store', JSON.stringify(data));
    } catch (error) {
      console.error('❌ Erreur sauvegarde embeddings store:', error);
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('eduai_embeddings_store');
      if (!stored) return;

      const data = JSON.parse(stored);
      
      this.documents = new Map(data.documents || []);
      this.index = new Map(data.index || []);

      console.log(`📚 ${this.documents.size} documents chargés depuis le stockage`);

    } catch (error) {
      console.error('❌ Erreur chargement embeddings store:', error);
      this.documents.clear();
      this.index.clear();
    }
  }
}

/**
 * 🤖 Service RAG (Retrieval-Augmented Generation)
 */
export class RAGService {
  private embeddingsStore: EmbeddingsStore;

  constructor(embeddingsStore: EmbeddingsStore) {
    this.embeddingsStore = embeddingsStore;
  }

  /**
   * 🧠 Génération augmentée par récupération
   */
  async generateWithContext(
    query: string,
    options: {
      maxContextDocuments?: number;
      contextThreshold?: number;
      includeMetadata?: boolean;
    } = {}
  ): Promise<{
    response: string;
    contextDocuments: EmbeddingDocument[];
    confidence: number;
  }> {
    const {
      maxContextDocuments = 5,
      contextThreshold = 0.75,
      includeMetadata = true
    } = options;

    try {
      // 1. Rechercher des documents pertinents
      const searchResult = await this.embeddingsStore.search(query, {
        limit: maxContextDocuments,
        threshold: contextThreshold
      });

      // 2. Construire le contexte
      const context = this.buildContext(searchResult.documents, includeMetadata);

      // 3. Générer la réponse avec le contexte
      const prompt = this.buildRAGPrompt(query, context);
      
      const response = await openAIClient.createChatCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant pédagogique expert. Utilise le contexte fourni pour répondre de manière précise et pédagogique.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      // 4. Calculer la confiance basée sur la similarité moyenne
      const confidence = searchResult.documents.length > 0
        ? searchResult.documents.reduce((sum, doc) => sum + (doc.similarity || 0), 0) / searchResult.documents.length
        : 0;

      return {
        response: response.choices[0].message.content || '',
        contextDocuments: searchResult.documents,
        confidence
      };

    } catch (error) {
      console.error('❌ Erreur génération RAG:', error);
      throw error;
    }
  }

  /**
   * 📝 Construire le contexte à partir des documents
   */
  private buildContext(documents: EmbeddingDocument[], includeMetadata: boolean): string {
    if (documents.length === 0) {
      return 'Aucun contexte pertinent trouvé.';
    }

    return documents.map((doc, index) => {
      let contextStr = `[Document ${index + 1}]\n${doc.content}`;
      
      if (includeMetadata) {
        contextStr += `\n(Type: ${doc.metadata.type}, Sujet: ${doc.metadata.subject}, Difficulté: ${doc.metadata.difficulty})`;
      }
      
      return contextStr;
    }).join('\n\n');
  }

  /**
   * 💬 Construire le prompt RAG
   */
  private buildRAGPrompt(query: string, context: string): string {
    return `Contexte disponible:
${context}

Question de l'utilisateur: ${query}

Instructions:
- Utilise UNIQUEMENT les informations du contexte fourni
- Si le contexte ne contient pas d'informations pertinentes, indique-le clairement
- Adapte ta réponse au niveau de difficulté approprié
- Sois pédagogique et précis
- Cite les sources du contexte quand c'est pertinent

Réponse:`;
  }
}

// Instance globale
export const embeddingsStore = new EmbeddingsStore();
export const ragService = new RAGService(embeddingsStore);

// Initialisation automatique
embeddingsStore.initialize().catch(console.error);
