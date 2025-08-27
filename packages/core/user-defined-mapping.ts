// 🎯 Universal Condition Mapping System
// Domain-neutral mapping between survey responses and output configurations

export interface OutputProtocol {
  condition_key: string;  
  protocol: {
    field1: FieldProtocol;
    field2: FieldProtocol;  
    field3: FieldProtocol;
    schedule: ScheduleProtocol;
    accessories: AccessoryProtocol;
  };
}

export interface FieldProtocol {
  sets: number;
  reps: number;
  intensity_percent: number;
  effort_rating: number;
  rest_minutes: number;
}

export interface ScheduleProtocol {
  frequency_per_week: number;
  block_length_weeks: number;
  deload_week: number;
  daily_schedule: string[];
}

export interface AccessoryProtocol {
  items: string[];
  sets: number;
  reps: string;
  intensity_percent: string;
  effort_rating: number;
  rest_minutes: string;
}

// Universal mapping table (domain-neutral)
export const CONDITION_MAPPINGS: OutputProtocol[] = [
  // User-defined mappings go here
];

export class ConditionMapper {
  
  // Find protocol mapping for survey data
  public findProtocol(surveyData: any): OutputProtocol | null {
    const conditionKey = this.buildConditionKey(surveyData);
    
    const protocol = CONDITION_MAPPINGS.find(
      mapping => mapping.condition_key === conditionKey
    );
    
    console.log(`🔍 Condition: ${conditionKey}`);
    console.log(`📋 Result: ${protocol ? 'Mapping found' : 'No mapping available'}`);
    
    return protocol || null;
  }

  // Generate condition key from survey data
  private buildConditionKey(surveyData: any): string {
    const level = surveyData.level || 'A';
    const category = surveyData.category || 'field1';
    const method = surveyData.method || 'standard';
    
    return `${level}-${category}-${method}`;
  }

  // Add new mapping
  public addMapping(protocol: OutputProtocol): void {
    CONDITION_MAPPINGS.push(protocol);
  }

  // List available conditions
  public getAvailableConditions(): string[] {
    return CONDITION_MAPPINGS.map(m => m.condition_key);
  }
}