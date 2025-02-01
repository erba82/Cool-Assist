// src/services/ads/AdService.ts
export class AdService {
    private static readonly adSlots = new Map<string, boolean>();
  
    static async initializeGoogleAds(): Promise<void> {
      try {
        await this.loadGoogleAdsScript();
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      } catch (error) {
        console.error('Failed to initialize Google Ads:', error);
      }
    }
  
    static async displayAd(slotId: string, format: 'banner' | 'responsive'): Promise<void> {
      if (this.adSlots.get(slotId)) {
        return; // Ad already displayed
      }
  
      try {
        const adElement = document.createElement('ins');
        adElement.className = 'adsbygoogle';
        adElement.setAttribute('data-ad-client', process.env.REACT_APP_GOOGLE_AD_CLIENT!);
        adElement.setAttribute('data-ad-slot', slotId);
  
        if (format === 'responsive') {
          adElement.setAttribute('data-ad-format', 'auto');
          adElement.setAttribute('data-full-width-responsive', 'true');
        }
  
        document.getElementById(slotId)?.appendChild(adElement);
        (window as any).adsbygoogle.push({});
        
        this.adSlots.set(slotId, true);
      } catch (error) {
        console.error('Failed to display ad:', error);
      }
    }
  
    private static loadGoogleAdsScript(): Promise<void> {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.head.appendChild(script);
      });
    }
  }