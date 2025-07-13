/**
 * 🔐 Service de Chiffrement des Données Sensibles
 * Chiffrement AES-256-GCM pour les données critiques avec gestion de clés
 */

import { aiMetrics } from './AIMonitoring';

// Types pour le chiffrement
export interface EncryptionConfig {
  algorithm: 'AES-GCM' | 'AES-CBC' | 'ChaCha20-Poly1305';
  keyLength: 128 | 192 | 256;
  ivLength: 12 | 16;
  tagLength?: 16; // Pour GCM
  iterations: number; // Pour PBKDF2
  saltLength: 16 | 32;
}

export interface EncryptedData {
  ciphertext: string; // Base64 encoded
  iv: string; // Base64 encoded
  salt: string; // Base64 encoded
  tag?: string; // Base64 encoded (pour GCM)
  algorithm: string;
  metadata: {
    keyId?: string;
    timestamp: string;
    version: number;
    checksum?: string;
  };
}

export interface KeyInfo {
  id: string;
  algorithm: string;
  created: Date;
  lastUsed: Date;
  usageCount: number;
  purpose: 'encryption' | 'signing' | 'hmac';
  status: 'active' | 'deprecated' | 'revoked';
  metadata: {
    description?: string;
    owner?: string;
    rotationSchedule?: string;
  };
}

export interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted' | 'top-secret';
  categories: string[]; // PII, financial, medical, etc.
  retention: {
    period: number; // en jours
    autoDelete: boolean;
  };
  access: {
    roles: string[];
    conditions: string[];
  };
}

export interface EncryptionRequest {
  data: any;
  classification: DataClassification;
  purpose: string;
  keyId?: string; // Clé spécifique à utiliser
  compress?: boolean;
  metadata?: Record<string, any>;
}

export interface DecryptionRequest {
  encryptedData: EncryptedData;
  keyId?: string;
  purpose: string;
  metadata?: Record<string, any>;
}

export interface KeyStats {
  totalKeys: number;
  activeKeys: number;
  deprecatedKeys: number;
  revokedKeys: number;
}

/**
 * 🔒 Gestionnaire de Chiffrement Avancé
 */
export class EncryptionService {
  private keys: Map<string, CryptoKey> = new Map();
  private keyInfo: Map<string, KeyInfo> = new Map();
  private config: EncryptionConfig;
  private isInitialized = false;

  constructor() {
    this.config = {
      algorithm: 'AES-GCM',
      keyLength: 256,
      ivLength: 12,
      tagLength: 16,
      iterations: 100000,
      saltLength: 32
    };
  }

  /**
   * 🚀 Initialisation du service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔐 Initialisation du service de chiffrement...');

      // Vérifier le support de Web Crypto API
      if (!crypto.subtle) {
        throw new Error('Web Crypto API non supportée dans cet environnement');
      }

      // Générer une clé maître par défaut si nécessaire
      await this.ensureMasterKey();

      this.isInitialized = true;
      console.log('✅ Service de chiffrement initialisé');

    } catch (error) {
      console.error('❌ Erreur initialisation chiffrement:', error);
      throw error;
    }
  }

  /**
   * 🔐 Chiffrement de données
   */
  async encryptData(request: EncryptionRequest): Promise<EncryptedData> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = performance.now();

    try {
      console.log(`🔐 Chiffrement données (${request.classification.level}):`, request.purpose);

      // 1. Sélectionner ou générer une clé
      const keyId = request.keyId || await this.getOrCreateKey('default', request.classification);
      const key = this.keys.get(keyId);
      if (!key) {
        throw new Error(`Clé introuvable: ${keyId}`);
      }

      // 2. Préparer les données
      let dataToEncrypt: string;
      if (typeof request.data === 'string') {
        dataToEncrypt = request.data;
      } else {
        dataToEncrypt = JSON.stringify(request.data);
      }

      // 3. Compression optionnelle
      if (request.compress && dataToEncrypt.length > 1000) {
        dataToEncrypt = await this.compressData(dataToEncrypt);
      }

      // 4. Générer IV et sel
      const iv = crypto.getRandomValues(new Uint8Array(this.config.ivLength));
      const salt = crypto.getRandomValues(new Uint8Array(this.config.saltLength));

      // 5. Chiffrer les données
      const encryptionResult = await this.performEncryption(
        dataToEncrypt,
        key,
        iv,
        salt
      );

      // 6. Calculer le checksum
      const checksum = await this.calculateChecksum(encryptionResult.ciphertext);

      // 7. Construire le résultat
      const result: EncryptedData = {
        ciphertext: this.arrayBufferToBase64(encryptionResult.ciphertext),
        iv: this.arrayBufferToBase64(iv),
        salt: this.arrayBufferToBase64(salt),
        tag: encryptionResult.tag ? this.arrayBufferToBase64(encryptionResult.tag) : undefined,
        algorithm: this.config.algorithm,
        metadata: {
          keyId,
          timestamp: new Date().toISOString(),
          version: 1,
          checksum
        }
      };

      // 8. Enregistrer les métriques
      const duration = performance.now() - startTime;
      await aiMetrics.recordMetric({
        service: 'encryption',
        operation: 'encrypt',
        duration,
        success: true,
        metadata: {
          algorithm: this.config.algorithm,
          dataSize: dataToEncrypt.length,
          classification: request.classification.level,
          keyId
        }
      });

      console.log(`✅ Données chiffrées (${dataToEncrypt.length} bytes → ${result.ciphertext.length} bytes)`);
      return result;

    } catch (error) {
      const duration = performance.now() - startTime;
      await aiMetrics.recordMetric({
        service: 'encryption',
        operation: 'encrypt',
        duration,
        success: false,
        error: (error as Error).message
      });

      console.error('❌ Erreur chiffrement:', error);
      throw error;
    }
  }

  /**
   * 🔓 Déchiffrement de données
   */
  async decryptData(request: DecryptionRequest): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = performance.now();

    try {
      console.log(`🔓 Déchiffrement données:`, request.purpose);

      const { encryptedData } = request;

      // 1. Vérifier l'intégrité
      const ciphertext = this.base64ToArrayBuffer(encryptedData.ciphertext);
      const expectedChecksum = await this.calculateChecksum(ciphertext);
      
      if (encryptedData.metadata.checksum && encryptedData.metadata.checksum !== expectedChecksum) {
        throw new Error('Échec vérification intégrité des données');
      }

      // 2. Récupérer la clé
      const keyId = request.keyId || encryptedData.metadata.keyId;
      if (!keyId) {
        throw new Error('Identifiant de clé manquant');
      }

      const key = this.keys.get(keyId);
      if (!key) {
        throw new Error(`Clé introuvable: ${keyId}`);
      }

      // 3. Décoder les données Base64
      const iv = new Uint8Array(this.base64ToArrayBuffer(encryptedData.iv));
      const salt = new Uint8Array(this.base64ToArrayBuffer(encryptedData.salt));
      const tag = encryptedData.tag ? this.base64ToArrayBuffer(encryptedData.tag) : undefined;

      // 4. Déchiffrer
      const decryptedBuffer = await this.performDecryption(
        ciphertext,
        key,
        iv,
        salt,
        tag
      );

      // 5. Décoder le texte
      const plaintext = new TextDecoder().decode(decryptedBuffer);

      // 6. Décompresser si nécessaire
      let result: any;
      try {
        result = JSON.parse(plaintext);
      } catch {
        result = plaintext;
      }

      // 7. Enregistrer les métriques
      const duration = performance.now() - startTime;
      await aiMetrics.recordMetric({
        service: 'encryption',
        operation: 'decrypt',
        duration,
        success: true,
        metadata: {
          algorithm: encryptedData.algorithm,
          dataSize: plaintext.length,
          keyId
        }
      });

      console.log(`✅ Données déchiffrées (${encryptedData.ciphertext.length} bytes → ${plaintext.length} bytes)`);
      return result;

    } catch (error) {
      const duration = performance.now() - startTime;
      await aiMetrics.recordMetric({
        service: 'encryption',
        operation: 'decrypt',
        duration,
        success: false,
        error: (error as Error).message
      });

      console.error('❌ Erreur déchiffrement:', error);
      throw error;
    }
  }

  /**
   * 🔧 Méthodes privées
   */
  private async performEncryption(
    data: string,
    key: CryptoKey,
    iv: Uint8Array,
    salt: Uint8Array
  ): Promise<{ ciphertext: ArrayBuffer; tag?: ArrayBuffer }> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    switch (this.config.algorithm) {
      case 'AES-GCM':
        const encryptedData = await crypto.subtle.encrypt(
          {
            name: 'AES-GCM',
            iv: iv,
            tagLength: (this.config.tagLength || 16) * 8
          },
          key,
          dataBuffer
        );

        // Séparer le ciphertext et le tag pour AES-GCM
        const ciphertext = encryptedData.slice(0, encryptedData.byteLength - (this.config.tagLength || 16));
        const tag = encryptedData.slice(encryptedData.byteLength - (this.config.tagLength || 16));
        
        return { ciphertext, tag };

      case 'AES-CBC':
        const cbcResult = await crypto.subtle.encrypt(
          {
            name: 'AES-CBC',
            iv: iv
          },
          key,
          dataBuffer
        );
        return { ciphertext: cbcResult };

      default:
        throw new Error(`Algorithme non supporté: ${this.config.algorithm}`);
    }
  }

  private async performDecryption(
    ciphertext: ArrayBuffer,
    key: CryptoKey,
    iv: Uint8Array,
    salt: Uint8Array,
    tag?: ArrayBuffer
  ): Promise<ArrayBuffer> {
    switch (this.config.algorithm) {
      case 'AES-GCM':
        if (!tag) {
          throw new Error('Tag requis pour AES-GCM');
        }

        // Reconstituer les données avec le tag
        const gcmData = new Uint8Array(ciphertext.byteLength + tag.byteLength);
        gcmData.set(new Uint8Array(ciphertext), 0);
        gcmData.set(new Uint8Array(tag), ciphertext.byteLength);

        return await crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: iv,
            tagLength: (this.config.tagLength || 16) * 8
          },
          key,
          gcmData
        );

      case 'AES-CBC':
        return await crypto.subtle.decrypt(
          {
            name: 'AES-CBC',
            iv: iv
          },
          key,
          ciphertext
        );

      default:
        throw new Error(`Algorithme non supporté: ${this.config.algorithm}`);
    }
  }

  private async ensureMasterKey(): Promise<void> {
    if (!this.keys.has('default')) {
      const key = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: this.config.keyLength
        },
        false, // Non extractible
        ['encrypt', 'decrypt']
      );

      this.keys.set('default', key);
      this.keyInfo.set('default', {
        id: 'default',
        algorithm: this.config.algorithm,
        created: new Date(),
        lastUsed: new Date(),
        usageCount: 0,
        purpose: 'encryption',
        status: 'active',
        metadata: {
          description: 'Clé maître par défaut',
          owner: 'system'
        }
      });
    }
  }

  private async getOrCreateKey(purpose: string, classification: DataClassification): Promise<string> {
    const keyId = `${purpose}_${classification.level}`;
    
    if (!this.keys.has(keyId)) {
      const key = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: this.config.keyLength
        },
        false,
        ['encrypt', 'decrypt']
      );

      this.keys.set(keyId, key);
      this.keyInfo.set(keyId, {
        id: keyId,
        algorithm: this.config.algorithm,
        created: new Date(),
        lastUsed: new Date(),
        usageCount: 0,
        purpose: 'encryption',
        status: 'active',
        metadata: {
          description: `Clé pour ${purpose} - ${classification.level}`,
          owner: 'system'
        }
      });
    }

    return keyId;
  }

  private async compressData(data: string): Promise<string> {
    // Simulation de compression - en pratique, utiliser une vraie bibliothèque
    return data;
  }

  private async calculateChecksum(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.arrayBufferToBase64(hashBuffer);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * 📊 Méthodes publiques d'administration
   */
  getKeyInfo(): KeyInfo[] {
    return Array.from(this.keyInfo.values());
  }

  getKeyStats(): KeyStats {
    const keyInfoArray = Array.from(this.keyInfo.values());
    return {
      totalKeys: keyInfoArray.length,
      activeKeys: keyInfoArray.filter(k => k.status === 'active').length,
      deprecatedKeys: keyInfoArray.filter(k => k.status === 'deprecated').length,
      revokedKeys: keyInfoArray.filter(k => k.status === 'revoked').length
    };
  }

  async rotateKey(keyId: string): Promise<void> {
    const oldKeyInfo = this.keyInfo.get(keyId);
    if (!oldKeyInfo) {
      throw new Error(`Clé introuvable: ${keyId}`);
    }

    // Marquer l'ancienne clé comme dépréciée
    oldKeyInfo.status = 'deprecated';

    // Générer une nouvelle clé
    const newKey = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: this.config.keyLength
      },
      false,
      ['encrypt', 'decrypt']
    );

    this.keys.set(keyId, newKey);
    oldKeyInfo.lastUsed = new Date();

    console.log(`🔄 Clé rotée: ${keyId}`);
  }

  updateConfig(newConfig: Partial<EncryptionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuration de chiffrement mise à jour');
  }

  getConfig(): EncryptionConfig {
    return { ...this.config };
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * 🧪 Méthodes de test et validation
   */
  async testEncryption(): Promise<boolean> {
    try {
      const testData = 'Test data for encryption validation';
      const testRequest: EncryptionRequest = {
        data: testData,
        classification: {
          level: 'internal',
          categories: ['test'],
          retention: { period: 30, autoDelete: false },
          access: { roles: ['admin'], conditions: [] }
        },
        purpose: 'test'
      };

      const encrypted = await this.encryptData(testRequest);
      const decrypted = await this.decryptData({
        encryptedData: encrypted,
        purpose: 'test'
      });

      return decrypted === testData;
    } catch (error) {
      console.error('❌ Test de chiffrement échoué:', error);
      return false;
    }
  }

  /**
   * 👤 Méthodes spécialisées pour types de données
   */
  async encryptUserData(userData: any, userId: string): Promise<EncryptedData> {
    return this.encryptData({
      data: userData,
      classification: {
        level: 'confidential',
        categories: ['PII', 'user'],
        retention: { period: 365, autoDelete: false },
        access: { roles: ['admin', 'user'], conditions: [`userId:${userId}`] }
      },
      purpose: `user_data_${userId}`
    });
  }

  async encryptAPIKey(apiKey: string, service: string): Promise<EncryptedData> {
    return this.encryptData({
      data: apiKey,
      classification: {
        level: 'top-secret',
        categories: ['credentials', 'api'],
        retention: { period: 90, autoDelete: true },
        access: { roles: ['admin'], conditions: [] }
      },
      purpose: `api_key_${service}`
    });
  }
}

// Instance globale
export const encryptionService = new EncryptionService();
