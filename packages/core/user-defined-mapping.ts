// 🎯 사용자 정의 조건매핑 시스템
// 👨‍💼 코치가 직접 설정하는 수치 테이블

export interface UserDefinedRule {
  condition_key: string;  // "beginner-strength-straight_sets"
  protocol: {
    // 🏋️ 사용자가 정한 정확한 수치들
    squat: {
      sets: number;
      reps: number;
      weight_percent: number;
      rpe: number;
      rest_minutes: number;
    };
    bench: {
      sets: number;
      reps: number;
      weight_percent: number;
      rpe: number;
      rest_minutes: number;
    };
    deadlift: {
      sets: number;
      reps: number;
      weight_percent: number;
      rpe: number;
      rest_minutes: number;
    };
    // 📅 스케줄링
    days_per_week: number;
    block_length_weeks: number;
    deload_week: number;
    // 💪 보조 운동
    accessory_sets: number;
    accessory_reps: string; // "8-12"
    accessory_rpe: number;
  };
}

// 🗂️ 사용자 정의 매핑 테이블 (코치가 직접 설정)
export const USER_DEFINED_MAPPINGS: UserDefinedRule[] = [
  {
    condition_key: "beginner-strength-straight_sets",
    protocol: {
      squat: {
        sets: 5,
        reps: 5,
        weight_percent: 75,
        rpe: 8,
        rest_minutes: 3
      },
      bench: {
        sets: 3,
        reps: 8,
        weight_percent: 70,
        rpe: 7,
        rest_minutes: 2
      },
      deadlift: {
        sets: 3,
        reps: 5,
        weight_percent: 80,
        rpe: 8,
        rest_minutes: 4
      },
      days_per_week: 3,
      block_length_weeks: 4,
      deload_week: 4,
      accessory_sets: 3,
      accessory_reps: "8-12",
      accessory_rpe: 7
    }
  },
  {
    condition_key: "beginner-strength-down_sets",
    protocol: {
      squat: {
        sets: 5, // 메인 3세트 + 백오프 2세트
        reps: 5, // 메인은 5회, 백오프는 8회
        weight_percent: 75, // 메인 75%, 백오프 65%
        rpe: 8,
        rest_minutes: 3
      },
      bench: {
        sets: 4,
        reps: 6,
        weight_percent: 70,
        rpe: 7,
        rest_minutes: 2
      },
      deadlift: {
        sets: 4,
        reps: 5,
        weight_percent: 80,
        rpe: 8,
        rest_minutes: 4
      },
      days_per_week: 3,
      block_length_weeks: 6,
      deload_week: 6,
      accessory_sets: 3,
      accessory_reps: "10-15",
      accessory_rpe: 6
    }
  },
  {
    condition_key: "intermediate-strength-straight_sets",
    protocol: {
      squat: {
        sets: 5,
        reps: 3,
        weight_percent: 85,
        rpe: 9,
        rest_minutes: 4
      },
      bench: {
        sets: 4,
        reps: 5,
        weight_percent: 80,
        rpe: 8,
        rest_minutes: 3
      },
      deadlift: {
        sets: 3,
        reps: 3,
        weight_percent: 90,
        rpe: 9,
        rest_minutes: 5
      },
      days_per_week: 4,
      block_length_weeks: 6,
      deload_week: 6,
      accessory_sets: 4,
      accessory_reps: "6-10",
      accessory_rpe: 8
    }
  },
  {
    condition_key: "intermediate-strength-down_sets",
    protocol: {
      squat: {
        sets: 6, // 메인 4세트 + 백오프 2세트
        reps: 3,
        weight_percent: 85,
        rpe: 9,
        rest_minutes: 4
      },
      bench: {
        sets: 5,
        reps: 4,
        weight_percent: 82,
        rpe: 8,
        rest_minutes: 3
      },
      deadlift: {
        sets: 4,
        reps: 2,
        weight_percent: 92,
        rpe: 9,
        rest_minutes: 5
      },
      days_per_week: 4,
      block_length_weeks: 8,
      deload_week: 8,
      accessory_sets: 4,
      accessory_reps: "8-12",
      accessory_rpe: 7
    }
  }
  // ✏️ 여기에 사용자가 계속 추가할 수 있음!
];

export class UserDefinedMapper {
  
  // 🎯 설문 조건을 사용자 정의 수치로 매핑
  public mapToUserDefinedProtocol(surveyData: any): UserDefinedRule | null {
    // 1. 설문 데이터에서 조건 키 생성
    const conditionKey = this.buildConditionKey(surveyData);
    
    // 2. 사용자 정의 테이블에서 찾기
    const matchingRule = USER_DEFINED_MAPPINGS.find(
      rule => rule.condition_key === conditionKey
    );
    
    console.log(`🔍 [UserMapper] 조건키: ${conditionKey}`);
    console.log(`📋 [UserMapper] 매칭결과: ${matchingRule ? '발견' : '없음'}`);
    
    return matchingRule || null;
  }

  // 🔑 설문 데이터 → 조건 키 변환
  private buildConditionKey(surveyData: any): string {
    const experience = surveyData.experience_level || 'beginner';
    const goal = this.extractPrimaryGoal(surveyData.goals);
    const backoffMethod = surveyData.backoff_method || 'straight_sets';
    
    return `${experience}-${goal}-${backoffMethod}`;
  }

  // 🎯 주요 목표 추출
  private extractPrimaryGoal(goals: string[]): string {
    if (!goals || goals.length === 0) return 'strength';
    
    // 우선순위: strength > muscle > competition > health
    if (goals.includes('strength')) return 'strength';
    if (goals.includes('muscle')) return 'muscle';
    if (goals.includes('competition')) return 'competition';
    return 'health';
  }

  // 📋 사용 가능한 조건키 목록
  public getAvailableConditions(): string[] {
    return USER_DEFINED_MAPPINGS.map(rule => rule.condition_key);
  }

  // ➕ 새 규칙 추가 (나중에 UI에서 사용)
  public addUserRule(rule: UserDefinedRule): void {
    USER_DEFINED_MAPPINGS.push(rule);
  }
}