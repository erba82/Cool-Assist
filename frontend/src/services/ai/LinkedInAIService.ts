import { ApiService } from '../api';
import { ErrorHandler } from '../errorHandling/ErrorHandler';

interface LinkedInProfile {
  industry: string;
  experience: Array<{
    title: string;
    company: string;
    description: string;
    duration: string;
  }>;
  skills: string[];
  education: Array<{
    degree: string;
    field: string;
    school: string;
  }>;
  languages: string[];
  certifications: string[];
  interests: string[];
}

interface AIPersonalization {
  communicationStyle: string;
  technicalLevel: 'beginner' | 'intermediate' | 'expert';
  preferredTopics: string[];
  industryContext: string[];
  recommendedFeatures: string[];
  learningPath: string[];
}

export class LinkedInAIService {
  private static instance: LinkedInAIService;
  private userProfile: LinkedInProfile | null = null;
  private aiPersonalization: AIPersonalization | null = null;

  private constructor() {}

  static getInstance(): LinkedInAIService {
    if (!LinkedInAIService.instance) {
      LinkedInAIService.instance = new LinkedInAIService();
    }
    return LinkedInAIService.instance;
  }

  async initializeAILearning(accessToken: string): Promise<void> {
    try {
      // Fetch LinkedIn profile data
      this.userProfile = await this.fetchLinkedInProfile(accessToken);
      
      // Analyze profile and generate personalization
      this.aiPersonalization = await this.analyzeProfile(this.userProfile);
      
      // Store personalization settings
      await this.savePersonalization(this.aiPersonalization);
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'LinkedInAIService.initializeAILearning');
      throw error;
    }
  }

  private async fetchLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
    try {
      const response = await ApiService.get('/api/linkedin/profile', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch LinkedIn profile');
    }
  }

  private async analyzeProfile(profile: LinkedInProfile): Promise<AIPersonalization> {
    try {
      // Analyze technical level based on experience and skills
      const technicalLevel = this.determineTechnicalLevel(profile);

      // Analyze communication style based on industry and experience
      const communicationStyle = this.determineCommunicationStyle(profile);

      // Identify relevant topics based on skills and interests
      const preferredTopics = this.identifyPreferredTopics(profile);

      // Generate industry-specific context
      const industryContext = this.generateIndustryContext(profile);

      // Create personalized learning path
      const learningPath = this.createLearningPath(profile);

      // Determine recommended features
      const recommendedFeatures = this.determineRecommendedFeatures(profile);

      return {
        technicalLevel,
        communicationStyle,
        preferredTopics,
        industryContext,
        learningPath,
        recommendedFeatures
      };
    } catch (error) {
      throw new Error('Failed to analyze profile');
    }
  }

  private determineTechnicalLevel(profile: LinkedInProfile): 'beginner' | 'intermediate' | 'expert' {
    const experienceYears = profile.experience.reduce((total, exp) => {
      const years = parseInt(exp.duration.split(' ')[0]) || 0;
      return total + years;
    }, 0);

    const technicalSkills = profile.skills.filter(skill => 
      this.isTechnicalSkill(skill)
    ).length;

    if (experienceYears > 8 && technicalSkills > 10) return 'expert';
    if (experienceYears > 3 && technicalSkills > 5) return 'intermediate';
    return 'beginner';
  }

  private determineCommunicationStyle(profile: LinkedInProfile): string {
    const industry = profile.industry.toLowerCase();
    
    if (industry.includes('academic') || industry.includes('research')) {
      return 'academic';
    } else if (industry.includes('technical') || industry.includes('engineering')) {
      return 'technical';
    } else if (industry.includes('management') || industry.includes('consulting')) {
      return 'business';
    }
    return 'balanced';
  }

  private identifyPreferredTopics(profile: LinkedInProfile): string[] {
    const topics = new Set<string>();
    
    // Add topics from skills
    profile.skills.forEach(skill => {
      const category = this.categorizeSkill(skill);
      if (category) topics.add(category);
    });

    // Add topics from interests
    profile.interests.forEach(interest => {
      const category = this.categorizeInterest(interest);
      if (category) topics.add(category);
    });

    return Array.from(topics);
  }

  private generateIndustryContext(profile: LinkedInProfile): string[] {
    const context = new Set<string>();
    
    // Add industry-specific contexts
    context.add(profile.industry);
    
    // Add contexts from experience
    profile.experience.forEach(exp => {
      const industryContexts = this.extractIndustryContext(exp.description);
      industryContexts.forEach(ctx => context.add(ctx));
    });

    return Array.from(context);
  }

  private createLearningPath(profile: LinkedInProfile): string[] {
    const learningPath = [];
    const technicalLevel = this.determineTechnicalLevel(profile);

    switch (technicalLevel) {
      case 'beginner':
        learningPath.push(
          'Basic System Components',
          'HVAC Fundamentals',
          'Introduction to Controls',
          'Basic Calculations'
        );
        break;
      case 'intermediate':
        learningPath.push(
          'Advanced System Design',
          'Energy Optimization',
          'Performance Analysis',
          'Automation Integration'
        );
        break;
      case 'expert':
        learningPath.push(
          'System Innovation',
          'AI Integration',
          'Advanced Optimization',
          'Industry Leadership'
        );
        break;
    }

    return learningPath;
  }

  private determineRecommendedFeatures(profile: LinkedInProfile): string[] {
    const features = new Set<string>();
    const technicalLevel = this.determineTechnicalLevel(profile);

    // Base features for all levels
    features.add('Basic Calculations');
    features.add('System Monitoring');

    // Add level-specific features
    switch (technicalLevel) {
      case 'expert':
        features.add('Advanced Analytics');
        features.add('Custom Automation');
        features.add('System Design Tools');
        break;
      case 'intermediate':
        features.add('Performance Optimization');
        features.add('Maintenance Planning');
        break;
      case 'beginner':
        features.add('Guided Tutorials');
        features.add('Basic Templates');
        break;
    }

    return Array.from(features);
  }

  private async savePersonalization(personalization: AIPersonalization): Promise<void> {
    try {
      await ApiService.post('/api/ai/personalization', personalization);
    } catch (error) {
      throw new Error('Failed to save personalization settings');
    }
  }

  async getPersonalization(): Promise<AIPersonalization | null> {
    return this.aiPersonalization;
  }

  async updateLearningFromInteraction(interaction: any): Promise<void> {
    try {
      // Update AI model based on user interaction
      const updatedPersonalization = await ApiService.post('/api/ai/learn', {
        currentPersonalization: this.aiPersonalization,
        interaction
      });

      this.aiPersonalization = updatedPersonalization.data;
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'LinkedInAIService.updateLearningFromInteraction');
    }
  }

  private isTechnicalSkill(skill: string): boolean {
    const technicalKeywords = [
      'engineering', 'programming', 'technical', 'hvac',
      'automation', 'design', 'analysis', 'system'
    ];
    return technicalKeywords.some(keyword => 
      skill.toLowerCase().includes(keyword)
    );
  }

  private categorizeSkill(skill: string): string | null {
    // Add skill categorization logic
    const categories: { [key: string]: string[] } = {
      'HVAC': ['hvac', 'cooling', 'heating', 'ventilation'],
      'Engineering': ['engineering', 'design', 'technical'],
      'Programming': ['programming', 'coding', 'development'],
      'Analysis': ['analysis', 'analytics', 'optimization']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => skill.toLowerCase().includes(keyword))) {
        return category;
      }
    }
    return null;
  }

  private categorizeInterest(interest: string): string | null {
    // Similar to categorizeSkill but for interests
    return this.categorizeSkill(interest); // For simplicity, using the same categorization
  }

  private extractIndustryContext(description: string): string[] {
    const contexts = new Set<string>();
    const industryKeywords = [
      'manufacturing', 'construction', 'energy',
      'commercial', 'residential', 'industrial'
    ];

    industryKeywords.forEach(keyword => {
      if (description.toLowerCase().includes(keyword)) {
        contexts.add(keyword);
      }
    });

    return Array.from(contexts);
  }
}