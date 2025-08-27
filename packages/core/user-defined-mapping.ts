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

// 🗂️ 코치 전용 매핑 테이블 (기본 매핑 포함)
export const COACHING_MAPPINGS: TrainingProtocol[] = [
  // 기본 매핑들 - 코치가 바로 사용할 수 있도록
  {
    condition_key: 'beginner-strength-straight_sets',
    protocol: {
      exercise1: { sets: 3, reps: 8, weight_percent: 70, rpe: 7, rest_minutes: 3 },
      exercise2: { sets: 3, reps: 8, weight_percent: 65, rpe: 7, rest_minutes: 3 },
      exercise3: { sets: 3, reps: 5, weight_percent: 75, rpe: 7, rest_minutes: 3 },
      schedule: { 
        days_per_week: 3, 
        block_length_weeks: 4, 
        deload_week: 4,
        daily_schedule: ['월', '수', '금']
      },
      accessories: {
        exercises: ['보조운동 1', '보조운동 2'],
        sets: 2,
        reps: '12-15',
        weight_percent: '60-70%',
        rpe: 6,
        rest_minutes: '2'
      }
    }
  },
  {
    condition_key: 'intermediate-strength-straight_sets',
    protocol: {
      exercise1: { sets: 4, reps: 6, weight_percent: 80, rpe: 8, rest_minutes: 4 },
      exercise2: { sets: 4, reps: 6, weight_percent: 75, rpe: 8, rest_minutes: 4 },
      exercise3: { sets: 3, reps: 4, weight_percent: 85, rpe: 8, rest_minutes: 4 },
      schedule: { 
        days_per_week: 4, 
        block_length_weeks: 6, 
        deload_week: 6,
        daily_schedule: ['월', '화', '목', '금']
      },
      accessories: {
        exercises: ['보조운동 1', '보조운동 2', '보조운동 3'],
        sets: 3,
        reps: '8-12',
        weight_percent: '65-75%',
        rpe: 7,
        rest_minutes: '2-3'
      }
    }
  }
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