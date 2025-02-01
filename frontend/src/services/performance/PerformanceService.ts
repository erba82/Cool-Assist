// src/services/performance/PerformanceService.ts
export class PerformanceService {
    private static instance: PerformanceService;
    private cache: Map<string, { data: any; timestamp: number }>;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
    private constructor() {
      this.cache = new Map();
    }
  
    static getInstance(): PerformanceService {
      if (!PerformanceService.instance) {
        PerformanceService.instance = new PerformanceService();
      }
      return PerformanceService.instance;
    }
  
    // Caching mechanism
    async getCachedData(key: string): Promise<any> {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }
      return null;
    }
  
    setCachedData(key: string, data: any): void {
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
    }
  
    // Code splitting helper
    async loadComponent(componentName: string) {
      return import(`../../components/${componentName}`);
    }
  
    // Resource preloading
    preloadResources(resources: string[]): void {
      resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.js') ? 'script' : 'style';
        document.head.appendChild(link);
      });
    }
  }