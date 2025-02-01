// src/services/subscription/SubscriptionService.ts
export enum PlanType {
    FREE = 'free',
    PREMIUM = 'premium',
    PROFESSIONAL = 'professional'
  }
  
  interface Feature {
    id: string;
    name: string;
    description: string;
    availableInPlans: PlanType[];
  }
  
  export class SubscriptionService {
    private static readonly features: Feature[] = [
      {
        id: 'basic-calc',
        name: 'Basic Calculations',
        description: 'Basic HVAC and refrigeration calculations',
        availableInPlans: [PlanType.FREE, PlanType.PREMIUM, PlanType.PROFESSIONAL]
      },
      {
        id: 'advanced-calc',
        name: 'Advanced Calculations',
        description: 'Advanced system design and optimization',
        availableInPlans: [PlanType.PREMIUM, PlanType.PROFESSIONAL]
      },
      // ... more features
    ];
  
    static isFeatureAvailable(featureId: string, userPlan: PlanType): boolean {
      const feature = this.features.find(f => f.id === featureId);
      return feature?.availableInPlans.includes(userPlan) || false;
    }
  
    static async upgradePlan(userId: string, newPlan: PlanType): Promise<void> {
      // Implement payment processing and plan upgrade
    }
  }