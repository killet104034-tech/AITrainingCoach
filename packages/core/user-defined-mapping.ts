// 🎯 코치 전용 조건매핑 시스템 (깔끔하게 최적화됨)

export interface TrainingProtocol {
  condition_key: string;  
  protocol: {
    exercise1: ExerciseProtocol;
    exercise2: ExerciseProtocol;  
    exercise3: ExerciseProtocol;
    schedule: ScheduleProtocol;
    accessories: AccessoryProtocol;
  };
}

export interface ExerciseProtocol {
  sets: number;
  reps: number;
  weight_percent: number;
  rpe: number;
  rest_minutes: number;
}

export interface ScheduleProtocol {
  days_per_week: number;
  block_length_weeks: number;
  deload_week: number;
  daily_schedule: string[];
}

export interface AccessoryProtocol {
  exercises: string[];
  sets: number;
  reps: string;
  weight_percent: string;
  rpe: number;
  rest_minutes: string;
}

// 🗂️ 코치 전용 매핑 테이블 (완전히 깨끗함)
export const COACHING_MAPPINGS: TrainingProtocol[] = [
  // 코치가 추가할 매핑들이 여기에 들어감
];

export class ConditionMapper {
  
  // 🎯 설문 → 코치 매핑 찾기 (깔끔하게 최적화)
  public findProtocol(surveyData: any): TrainingProtocol | null {
    const conditionKey = this.buildConditionKey(surveyData);
    
    const protocol = COACHING_MAPPINGS.find(
      mapping => mapping.condition_key === conditionKey
    );
    
    console.log(`🔍 조건: ${conditionKey}`);
    console.log(`📋 결과: ${protocol ? '매핑 발견' : '코치에게 문의 필요'}`);
    
    return protocol || null;
  }

  // 🔑 조건키 생성 (심플하게)
  private buildConditionKey(surveyData: any): string {
    const experience = surveyData.experience_level || 'beginner';
    const goal = surveyData.goals?.[0] || 'strength';
    const method = surveyData.backoff_method || 'straight_sets';
    
    return `${experience}-${goal}-${method}`;
  }

  // ➕ 코치 매핑 추가
  public addMapping(protocol: TrainingProtocol): void {
    COACHING_MAPPINGS.push(protocol);
  }

  // 📋 현재 매핑 목록
  public getAvailableConditions(): string[] {
    return COACHING_MAPPINGS.map(m => m.condition_key);
  }
}