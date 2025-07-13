/**
 * 🌐 Service CDN Intelligent pour Assets Statiques
 * Optimisation et distribution globale des ressources
 */

import { aiMetrics } from './AIMonitoring';

// Types pour la gestion CDN
export interface CDNProvider {
  id: string;
  name: string;
  baseUrl: string;
  regions: string[];
  priority: number;
  status: 'active' | 'inactive' | 'maintenance';
  performance: {
    averageLatency: number;
    successRate: number;
    bandwidth: number; // Mbps
    hitRatio: number;
  };
  limits: {
    maxFileSize: number; // en bytes
    dailyBandwidth: number; // en GB
    requestsPerSecond: number;
  };
  features: {
    compression: boolean;
    imageOptimization: boolean;
    caching: boolean;
    ssl: boolean;
    http2: boolean;
  };
}

export interface Asset {
  id: string;
  path: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'font' | 'css' | 'js' | 'json';
  size: number;
  hash: string;
  mimeType: string;
  lastModified: Date;
  metadata: {
    originalSize?: number;
    compressed: boolean;
    optimized: boolean;
    responsive: boolean;
    cacheable: boolean;
    versions: Array<{
      variant: string;
      size: number;
      url: string;
    }>;
  };
  distribution: {
    provider: string;
    urls: Record<string, string>; // region -> url
    status: 'uploading' | 'distributed' | 'failed';
    lastSync: Date;
  };
  usage: {
    requests: number;
    bandwidth: number;
    lastAccess: Date;
    popularRegions: string[];
  };
}

export interface CDNConfig {
  primaryProvider: string;
  fallbackProviders: string[];
  autoFailover: boolean;
  compressionEnabled: boolean;
  imageOptimization: boolean;
  cacheStrategy: 'aggressive' | 'balanced' | 'conservative';
  ttl: {
    images: number;
    videos: number;
    documents: number;
    scripts: number;
    styles: number;
  };
  optimization: {
    webpConversion: boolean;
    avifConversion: boolean;
    responsiveImages: boolean;
    lazyLoading: boolean;
    minification: boolean;
  };
}

export interface CDNStats {
  totalAssets: number;
  totalSize: number;
  totalRequests: number;
  totalBandwidth: number;
  hitRatio: number;
  averageLatency: number;
  costSavings: number;
  topAssets: Array<{
    path: string;
    requests: number;
    bandwidth: number;
  }>;
  regionStats: Record<string, {
    requests: number;
    latency: number;
    bandwidth: number;
  }>;
  performanceMetrics: {
    p50Latency: number;
    p95Latency: number;
    p99Latency: number;
    errorRate: number;
  };
}

/**
 * 🎯 Gestionnaire de CDN Intelligent
 */
export class CDNService {
  private providers: Map<string, CDNProvider> = new Map();
  private assets: Map<string, Asset> = new Map();
  private config: CDNConfig;
  private stats: CDNStats;
  private cache: Map<string, { data: any; timestamp: Date; ttl: number }> = new Map();
  private performanceMonitor?: NodeJS.Timeout;
  private syncMonitor?: NodeJS.Timeout;
  private isInitialized = false;

  constructor(config?: Partial<CDNConfig>) {
    this.config = {
      primaryProvider: 'cloudflare',
      fallbackProviders: ['amazonaws', 'cloudinary'],
      autoFailover: true,
      compressionEnabled: true,
      imageOptimization: true,
      cacheStrategy: 'balanced',
      ttl: {
        images: 7 * 24 * 60 * 60, // 7 jours
        videos: 30 * 24 * 60 * 60, // 30 jours
        documents: 24 * 60 * 60, // 1 jour
        scripts: 7 * 24 * 60 * 60, // 7 jours
        styles: 7 * 24 * 60 * 60 // 7 jours
      },
      optimization: {
        webpConversion: true,
        avifConversion: true,
        responsiveImages: true,
        lazyLoading: true,
        minification: true
      },
      ...config
    };

    this.stats = {
      totalAssets: 0,
      totalSize: 0,
      totalRequests: 0,
      totalBandwidth: 0,
      hitRatio: 0,
      averageLatency: 0,
      costSavings: 0,
      topAssets: [],
      regionStats: {},
      performanceMetrics: {
        p50Latency: 0,
        p95Latency: 0,
        p99Latency: 0,
        errorRate: 0
      }
    };

    this.initialize();
  }

  /**
   * 🚀 Initialisation du service
   */
  private async initialize(): Promise<void> {
    try {
      await this.setupProviders();
      await this.loadFromStorage();
      this.startPerformanceMonitoring();
      this.startSyncMonitoring();
      this.isInitialized = true;
      console.log('🌐 Service CDN initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation CDN:', error);
    }
  }

  /**
   * 🔧 Configuration des providers
   */
  private async setupProviders(): Promise<void> {
    const defaultProviders: CDNProvider[] = [
      {
        id: 'cloudflare',
        name: 'Cloudflare',
        baseUrl: 'https://cdn.eduai.app',
        regions: ['global'],
        priority: 1,
        status: 'active',
        performance: {
          averageLatency: 45,
          successRate: 0.999,
          bandwidth: 10000,
          hitRatio: 0.95
        },
        limits: {
          maxFileSize: 100 * 1024 * 1024, // 100MB
          dailyBandwidth: 1000, // 1TB
          requestsPerSecond: 10000
        },
        features: {
          compression: true,
          imageOptimization: true,
          caching: true,
          ssl: true,
          http2: true
        }
      },
      {
        id: 'amazonaws',
        name: 'Amazon CloudFront',
        baseUrl: 'https://d1234567890.cloudfront.net',
        regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
        priority: 2,
        status: 'active',
        performance: {
          averageLatency: 65,
          successRate: 0.998,
          bandwidth: 8000,
          hitRatio: 0.92
        },
        limits: {
          maxFileSize: 20 * 1024 * 1024, // 20MB
          dailyBandwidth: 500, // 500GB
          requestsPerSecond: 5000
        },
        features: {
          compression: true,
          imageOptimization: false,
          caching: true,
          ssl: true,
          http2: true
        }
      },
      {
        id: 'cloudinary',
        name: 'Cloudinary',
        baseUrl: 'https://res.cloudinary.com/eduai',
        regions: ['global'],
        priority: 3,
        status: 'active',
        performance: {
          averageLatency: 80,
          successRate: 0.997,
          bandwidth: 5000,
          hitRatio: 0.88
        },
        limits: {
          maxFileSize: 50 * 1024 * 1024, // 50MB
          dailyBandwidth: 200, // 200GB
          requestsPerSecond: 2000
        },
        features: {
          compression: true,
          imageOptimization: true,
          caching: true,
          ssl: true,
          http2: false
        }
      },
      {
        id: 'local_cache',
        name: 'Cache Local',
        baseUrl: '',
        regions: ['local'],
        priority: 0,
        status: 'active',
        performance: {
          averageLatency: 5,
          successRate: 1.0,
          bandwidth: 1000,
          hitRatio: 0.3
        },
        limits: {
          maxFileSize: 10 * 1024 * 1024, // 10MB
          dailyBandwidth: 50, // 50GB
          requestsPerSecond: 1000
        },
        features: {
          compression: false,
          imageOptimization: false,
          caching: true,
          ssl: false,
          http2: false
        }
      }
    ];

    for (const provider of defaultProviders) {
      this.providers.set(provider.id, provider);
    }
  }

  /**
   * 📤 Uploader un asset
   */
  async uploadAsset(
    file: File | Blob,
    path: string,
    options: {
      optimize?: boolean;
      responsive?: boolean;
      compress?: boolean;
      priority?: 'low' | 'normal' | 'high';
    } = {}
  ): Promise<Asset> {
    const startTime = Date.now();
    const assetId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Analyser le fichier
      const fileInfo = await this.analyzeFile(file);
      const assetType = this.detectAssetType(file.type, path);

      // Créer l'asset
      const asset: Asset = {
        id: assetId,
        path,
        type: assetType,
        size: file.size,
        hash: await this.calculateHash(file),
        mimeType: file.type,
        lastModified: new Date(),
        metadata: {
          originalSize: file.size,
          compressed: false,
          optimized: false,
          responsive: false,
          cacheable: this.isCacheable(assetType),
          versions: []
        },
        distribution: {
          provider: this.config.primaryProvider,
          urls: {},
          status: 'uploading',
          lastSync: new Date()
        },
        usage: {
          requests: 0,
          bandwidth: 0,
          lastAccess: new Date(),
          popularRegions: []
        }
      };

      // Optimiser si demandé
      let processedFile = file;
      if (options.optimize && this.config.imageOptimization && assetType === 'image') {
        processedFile = await this.optimizeImage(file, options);
        asset.metadata.optimized = true;
      }

      // Compresser si demandé
      if (options.compress && this.config.compressionEnabled) {
        processedFile = await this.compressFile(processedFile);
        asset.metadata.compressed = true;
      }

      // Créer les versions responsives
      if (options.responsive && assetType === 'image') {
        const versions = await this.createResponsiveVersions(processedFile, path);
        asset.metadata.versions = versions;
        asset.metadata.responsive = true;
      }

      // Uploader vers le provider principal
      const primaryProvider = this.providers.get(this.config.primaryProvider)!;
      const uploadResult = await this.uploadToProvider(processedFile, asset, primaryProvider);
      
      asset.distribution.urls[primaryProvider.regions[0]] = uploadResult.url;
      asset.distribution.status = 'distributed';

      // Uploader vers les providers de fallback si configuré
      if (options.priority === 'high') {
        for (const fallbackId of this.config.fallbackProviders) {
          const fallbackProvider = this.providers.get(fallbackId);
          if (fallbackProvider && fallbackProvider.status === 'active') {
            try {
              const fallbackResult = await this.uploadToProvider(processedFile, asset, fallbackProvider);
              asset.distribution.urls[fallbackProvider.regions[0]] = fallbackResult.url;
            } catch (error) {
              console.warn(`⚠️ Échec upload fallback ${fallbackId}:`, error);
            }
          }
        }
      }

      // Enregistrer l'asset
      this.assets.set(assetId, asset);
      this.stats.totalAssets++;
      this.stats.totalSize += asset.size;

      // Sauvegarder
      this.saveToStorage();

      // Enregistrer la métrique
      aiMetrics.recordMetric({
        service: 'cdn',
        operation: 'upload',
        duration: Date.now() - startTime,
        success: true,
        metadata: {
          assetId,
          type: assetType,
          size: asset.size,
          optimized: asset.metadata.optimized,
          compressed: asset.metadata.compressed,
          responsive: asset.metadata.responsive
        }
      });

      console.log(`📤 Asset uploadé: ${path} (${this.formatBytes(asset.size)})`);
      return asset;

    } catch (error) {
      aiMetrics.recordMetric({
        service: 'cdn',
        operation: 'upload',
        duration: Date.now() - startTime,
        success: false,
        error: (error as Error).message
      });

      console.error(`❌ Erreur upload asset ${path}:`, error);
      throw error;
    }
  }

  /**
   * 📥 Récupérer un asset optimisé
   */
  async getAsset(
    path: string,
    options: {
      region?: string;
      variant?: string;
      quality?: 'low' | 'medium' | 'high' | 'original';
      format?: 'webp' | 'avif' | 'jpg' | 'png' | 'original';
    } = {}
  ): Promise<string> {
    const startTime = Date.now();
    const cacheKey = `asset_${path}_${JSON.stringify(options)}`;

    try {
      // Vérifier le cache local
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp.getTime() < cached.ttl) {
        this.recordAssetAccess(path, 0, true);
        return cached.data;
      }

      // Trouver l'asset
      const asset = Array.from(this.assets.values()).find(a => a.path === path);
      if (!asset) {
        throw new Error(`Asset non trouvé: ${path}`);
      }

      // Sélectionner le provider optimal
      const provider = await this.selectOptimalProvider(options.region);
      
      // Construire l'URL
      let url = this.buildAssetUrl(asset, provider, options);

      // Vérifier la disponibilité
      const isAvailable = await this.checkAssetAvailability(url);
      if (!isAvailable && this.config.autoFailover) {
        // Failover vers un autre provider
        const fallbackProvider = await this.selectFallbackProvider(provider.id, options.region);
        if (fallbackProvider) {
          url = this.buildAssetUrl(asset, fallbackProvider, options);
          console.log(`🔄 Failover vers ${fallbackProvider.name} pour ${path}`);
        }
      }

      // Mettre en cache
      const ttl = this.getTTL(asset.type);
      this.cache.set(cacheKey, {
        data: url,
        timestamp: new Date(),
        ttl: ttl * 1000
      });

      // Enregistrer l'accès
      const latency = Date.now() - startTime;
      this.recordAssetAccess(path, latency, false);

      // Enregistrer la métrique
      aiMetrics.recordMetric({
        service: 'cdn',
        operation: 'get_asset',
        duration: latency,
        success: true,
        metadata: {
          path,
          provider: provider.id,
          region: options.region,
          cached: false,
          variant: options.variant
        }
      });

      return url;

    } catch (error) {
      aiMetrics.recordMetric({
        service: 'cdn',
        operation: 'get_asset',
        duration: Date.now() - startTime,
        success: false,
        error: (error as Error).message
      });

      console.error(`❌ Erreur récupération asset ${path}:`, error);
      throw error;
    }
  }

  /**
   * 🔍 Analyser un fichier
   */
  private async analyzeFile(file: File | Blob): Promise<any> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          size: file.size,
          type: file.type,
          dataUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * 🎯 Détecter le type d'asset
   */
  private detectAssetType(mimeType: string, path: string): Asset['type'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('font/') || path.includes('.woff') || path.includes('.ttf')) return 'font';
    if (mimeType === 'text/css' || path.endsWith('.css')) return 'css';
    if (mimeType === 'application/javascript' || path.endsWith('.js')) return 'js';
    if (mimeType === 'application/json' || path.endsWith('.json')) return 'json';
    return 'document';
  }

  /**
   * 🧮 Calculer le hash d'un fichier
   */
  private async calculateHash(file: File | Blob): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 🖼️ Optimiser une image
   */
  private async optimizeImage(file: File | Blob, options: any): Promise<File | Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculer les nouvelles dimensions
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dessiner l'image optimisée
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir en blob avec compression
        canvas.toBlob((blob) => {
          resolve(blob || file);
        }, 'image/jpeg', 0.85);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 🗜️ Compresser un fichier
   */
  private async compressFile(file: File | Blob): Promise<File | Blob> {
    // Simuler la compression
    // Dans un vrai cas, utiliser une librairie comme pako pour gzip
    console.log(`🗜️ Compression simulée pour ${file.type}`);
    return file;
  }

  /**
   * 📱 Créer des versions responsives
   */
  private async createResponsiveVersions(
    file: File | Blob,
    basePath: string
  ): Promise<Array<{ variant: string; size: number; url: string }>> {
    const versions = [];
    const breakpoints = [
      { name: 'small', width: 480 },
      { name: 'medium', width: 768 },
      { name: 'large', width: 1200 },
      { name: 'xlarge', width: 1920 }
    ];

    for (const breakpoint of breakpoints) {
      try {
        const resizedFile = await this.resizeImage(file, breakpoint.width);
        const variantPath = `${basePath}_${breakpoint.name}`;
        
        versions.push({
          variant: breakpoint.name,
          size: resizedFile.size,
          url: variantPath
        });
      } catch (error) {
        console.warn(`⚠️ Erreur création version ${breakpoint.name}:`, error);
      }
    }

    return versions;
  }

  /**
   * 📏 Redimensionner une image
   */
  private async resizeImage(file: File | Blob, maxWidth: number): Promise<File | Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          resolve(blob || file);
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * ☁️ Uploader vers un provider
   */
  private async uploadToProvider(
    file: File | Blob,
    asset: Asset,
    provider: CDNProvider
  ): Promise<{ url: string; success: boolean }> {
    // Simuler l'upload vers le CDN
    const delay = 500 + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simuler des échecs occasionnels
    if (Math.random() < 0.05) { // 5% d'échec
      throw new Error(`Échec upload vers ${provider.name}`);
    }
    
    const url = `${provider.baseUrl}/${asset.path}`;
    console.log(`☁️ Upload simulé vers ${provider.name}: ${url}`);
    
    return { url, success: true };
  }

  /**
   * 🎯 Sélectionner le provider optimal
   */
  private async selectOptimalProvider(preferredRegion?: string): Promise<CDNProvider> {
    const activeProviders = Array.from(this.providers.values())
      .filter(p => p.status === 'active')
      .sort((a, b) => a.priority - b.priority);

    if (preferredRegion) {
      const regionalProvider = activeProviders.find(p => 
        p.regions.includes(preferredRegion) || p.regions.includes('global')
      );
      if (regionalProvider) return regionalProvider;
    }

    // Sélectionner en fonction des performances
    return activeProviders.reduce((best, current) => {
      const bestScore = this.calculateProviderScore(best);
      const currentScore = this.calculateProviderScore(current);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * 📊 Calculer le score d'un provider
   */
  private calculateProviderScore(provider: CDNProvider): number {
    const latencyScore = Math.max(0, 1 - (provider.performance.averageLatency / 1000));
    const successScore = provider.performance.successRate;
    const hitRatioScore = provider.performance.hitRatio;
    const priorityScore = (10 - provider.priority) / 10;

    return (latencyScore * 0.3 + successScore * 0.3 + hitRatioScore * 0.2 + priorityScore * 0.2);
  }

  /**
   * 🔄 Sélectionner un provider de fallback
   */
  private async selectFallbackProvider(
    excludeProviderId: string,
    preferredRegion?: string
  ): Promise<CDNProvider | null> {
    const fallbackProviders = Array.from(this.providers.values())
      .filter(p => p.status === 'active' && p.id !== excludeProviderId)
      .sort((a, b) => this.calculateProviderScore(b) - this.calculateProviderScore(a));

    if (preferredRegion) {
      const regionalProvider = fallbackProviders.find(p => 
        p.regions.includes(preferredRegion) || p.regions.includes('global')
      );
      if (regionalProvider) return regionalProvider;
    }

    return fallbackProviders[0] || null;
  }

  /**
   * 🔗 Construire l'URL d'un asset
   */
  private buildAssetUrl(
    asset: Asset,
    provider: CDNProvider,
    options: {
      variant?: string;
      quality?: string;
      format?: string;
    }
  ): string {
    let url = `${provider.baseUrl}/${asset.path}`;
    
    // Ajouter les paramètres d'optimisation
    const params = new URLSearchParams();
    
    if (options.variant && asset.metadata.responsive) {
      const version = asset.metadata.versions.find(v => v.variant === options.variant);
      if (version) {
        url = `${provider.baseUrl}/${version.url}`;
      }
    }
    
    if (options.quality && options.quality !== 'original') {
      params.append('q', this.getQualityValue(options.quality));
    }
    
    if (options.format && options.format !== 'original' && provider.features.imageOptimization) {
      params.append('f', options.format);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return url;
  }

  /**
   * 🎚️ Obtenir la valeur de qualité
   */
  private getQualityValue(quality: string): string {
    const qualityMap = {
      low: '60',
      medium: '80',
      high: '95'
    };
    return qualityMap[quality as keyof typeof qualityMap] || '80';
  }

  /**
   * ✅ Vérifier la disponibilité d'un asset
   */
  private async checkAssetAvailability(url: string): Promise<boolean> {
    try {
      // Simuler une vérification de disponibilité
      await new Promise(resolve => setTimeout(resolve, 50));
      return Math.random() > 0.02; // 98% de disponibilité
    } catch {
      return false;
    }
  }

  /**
   * ⏱️ Obtenir le TTL pour un type d'asset
   */
  private getTTL(assetType: Asset['type']): number {
    return this.config.ttl[assetType as keyof typeof this.config.ttl] || 86400; // 1 jour par défaut
  }

  /**
   * 💾 Vérifier si un asset est cacheable
   */
  private isCacheable(assetType: Asset['type']): boolean {
    return ['image', 'video', 'audio', 'font', 'css', 'js'].includes(assetType);
  }

  /**
   * 📊 Enregistrer un accès à un asset
   */
  private recordAssetAccess(path: string, latency: number, fromCache: boolean): void {
    const asset = Array.from(this.assets.values()).find(a => a.path === path);
    if (!asset) return;

    asset.usage.requests++;
    asset.usage.bandwidth += asset.size;
    asset.usage.lastAccess = new Date();

    this.stats.totalRequests++;
    this.stats.totalBandwidth += asset.size;
    this.stats.averageLatency = 
      (this.stats.averageLatency * (this.stats.totalRequests - 1) + latency) / this.stats.totalRequests;

    if (fromCache) {
      this.stats.hitRatio = 
        (this.stats.hitRatio * (this.stats.totalRequests - 1) + 1) / this.stats.totalRequests;
    }
  }

  /**
   * 📈 Surveillance des performances
   */
  private startPerformanceMonitoring(): void {
    this.performanceMonitor = setInterval(() => {
      this.updatePerformanceStats();
      this.checkProviderHealth();
    }, 60000); // Toutes les minutes
  }

  private updatePerformanceStats(): void {
    // Mettre à jour les top assets
    const sortedAssets = Array.from(this.assets.values())
      .sort((a, b) => b.usage.requests - a.usage.requests)
      .slice(0, 10);

    this.stats.topAssets = sortedAssets.map(asset => ({
      path: asset.path,
      requests: asset.usage.requests,
      bandwidth: asset.usage.bandwidth
    }));

    // Calculer les économies de coût
    const totalTransfers = this.stats.totalBandwidth / (1024 * 1024 * 1024); // en GB
    const estimatedCostWithoutCDN = totalTransfers * 0.05; // $0.05/GB
    const estimatedCostWithCDN = totalTransfers * 0.01; // $0.01/GB
    this.stats.costSavings = Math.max(0, estimatedCostWithoutCDN - estimatedCostWithCDN);
  }

  private async checkProviderHealth(): Promise<void> {
    for (const provider of this.providers.values()) {
      try {
        // Simuler un health check
        const startTime = Date.now();
        const isHealthy = Math.random() > 0.05; // 95% de succès
        const latency = Date.now() - startTime + Math.random() * 100;

        if (isHealthy) {
          provider.performance.averageLatency = 
            (provider.performance.averageLatency * 0.9) + (latency * 0.1);
          
          if (provider.status === 'inactive') {
            provider.status = 'active';
            console.log(`✅ Provider récupéré: ${provider.name}`);
          }
        } else {
          provider.status = 'inactive';
          console.log(`❌ Provider indisponible: ${provider.name}`);
        }
      } catch (error) {
        console.error(`❌ Health check échoué pour ${provider.name}:`, error);
        provider.status = 'inactive';
      }
    }
  }

  /**
   * 🔄 Surveillance de synchronisation
   */
  private startSyncMonitoring(): void {
    this.syncMonitor = setInterval(async () => {
      await this.syncAssets();
    }, 5 * 60 * 1000); // Toutes les 5 minutes
  }

  private async syncAssets(): Promise<void> {
    console.log('🔄 Synchronisation des assets...');
    
    for (const asset of this.assets.values()) {
      if (asset.distribution.status === 'distributed') {
        // Vérifier que l'asset est disponible sur tous les providers
        for (const [region, url] of Object.entries(asset.distribution.urls)) {
          const isAvailable = await this.checkAssetAvailability(url);
          if (!isAvailable) {
            console.warn(`⚠️ Asset indisponible: ${asset.path} sur ${region}`);
            // Ici on pourrait relancer l'upload
          }
        }
      }
    }
  }

  /**
   * 📊 Formater les bytes
   */
  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * 💾 Persistance
   */
  private saveToStorage(): void {
    try {
      const data = {
        assets: Array.from(this.assets.entries()),
        stats: this.stats,
        config: this.config,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('eduai_cdn', JSON.stringify(data));
    } catch (error) {
      console.error('❌ Erreur sauvegarde CDN:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('eduai_cdn');
      if (!stored) return;
      
      const data = JSON.parse(stored);
      
      if (data.assets) {
        this.assets = new Map(data.assets);
      }
      
      if (data.stats) {
        this.stats = { ...this.stats, ...data.stats };
      }
      
      console.log('💾 Configuration CDN chargée');
    } catch (error) {
      console.error('❌ Erreur chargement CDN:', error);
    }
  }

  /**
   * 📊 API publique
   */
  getStats(): CDNStats {
    this.updatePerformanceStats();
    return { ...this.stats };
  }

  getProviders(): CDNProvider[] {
    return Array.from(this.providers.values());
  }

  getAssets(filter?: { type?: string; provider?: string }): Asset[] {
    let assets = Array.from(this.assets.values());
    
    if (filter) {
      if (filter.type) assets = assets.filter(a => a.type === filter.type);
      if (filter.provider) assets = assets.filter(a => a.distribution.provider === filter.provider);
    }
    
    return assets;
  }

  async deleteAsset(assetId: string): Promise<boolean> {
    const asset = this.assets.get(assetId);
    if (!asset) return false;
    
    // Supprimer de tous les providers
    for (const url of Object.values(asset.distribution.urls)) {
      try {
        // Simuler la suppression
        console.log(`🗑️ Suppression simulée: ${url}`);
      } catch (error) {
        console.warn(`⚠️ Erreur suppression ${url}:`, error);
      }
    }
    
    this.assets.delete(assetId);
    this.stats.totalAssets--;
    this.stats.totalSize -= asset.size;
    
    this.saveToStorage();
    console.log(`🗑️ Asset supprimé: ${asset.path}`);
    return true;
  }

  addProvider(provider: CDNProvider): void {
    this.providers.set(provider.id, provider);
    console.log(`✅ Provider ajouté: ${provider.name}`);
  }

  updateProvider(providerId: string, updates: Partial<CDNProvider>): boolean {
    const provider = this.providers.get(providerId);
    if (!provider) return false;
    
    Object.assign(provider, updates);
    console.log(`🔧 Provider mis à jour: ${provider.name}`);
    return true;
  }

  clearCache(): number {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🧹 Cache CDN effacé: ${size} entrées supprimées`);
    return size;
  }

  destroy(): void {
    if (this.performanceMonitor) {
      clearInterval(this.performanceMonitor);
    }
    
    if (this.syncMonitor) {
      clearInterval(this.syncMonitor);
    }
  }
}

// Instance globale
export const cdnService = new CDNService();
