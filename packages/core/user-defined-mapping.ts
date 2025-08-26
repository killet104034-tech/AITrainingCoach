// 🎯 김동환 코치 전용 조건매핑 시스템  
// 👨‍💼 김동환님이 실제로 고객들에게 훈련을 짜주는 방식을 시스템화

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

// 🗂️ 김동환 코치 매핑 테이블 (김동환님이 실제로 훈련 짜는 방식)
export const DONGHWAN_COACHING_MAPPINGS: UserDefinedRule[] = [
  {
    condition_key: "beginner-strength-straight_sets-excited_style",
    protocol: {
      // 🎯 김동환님이 초급자+흥분스타일에게 근력훈련+스트레이트세트로 실제 짜주는 방식
      squat: {
        sets: 5,           // 김동환: "초급자는 볼륨이 중요해서 5세트"
        reps: 5,           // 김동환: "근력은 5회가 최적"
        weight_percent: 77, // 김동환: "흥분하는 타입은 2% 더 올려도 괜찮아"
        rpe: 9,            // 김동환: "흥분하는 애들은 RPE 9까지 밀어도 돼"
        rest_minutes: 2    // 김동환: "흥분하는 애들은 2분만 쉬어도 다음 세트 잘해"
      },
      bench: {
        sets: 3,           // 김동환: "벤치는 어깨 부담 있어서 3세트"  
        reps: 8,           // 김동환: "초급자 벤치는 8회로 폼 익히기"
        weight_percent: 70, // 김동환: "벤치는 보수적으로 70%"
        rpe: 7,            // 김동환: "벤치는 RPE 7이 안전"
        rest_minutes: 2    // 김동환: "벤치는 2분이면 충분"
      },
      deadlift: {
        sets: 3,           // 김동환: "데드는 피로 누적 심해서 3세트만"
        reps: 5,           // 김동환: "데드 5회가 폼 유지 한계"
        weight_percent: 80, // 김동환: "데드는 80%까지 올려도 괜찮아"
        rpe: 8,            // 김동환: "데드 RPE 8은 적당한 자극"
        rest_minutes: 4    // 김동환: "데드는 4분 쉬어야 다음 세트 가능"
      },
      days_per_week: 3,      // 김동환: "초급자는 주 3회가 최적 회복"
      block_length_weeks: 4, // 김동환: "4주면 적응하고 변화 필요"
      deload_week: 4,        // 김동환: "4주마다 디로드"
      accessory_sets: 3,     // 김동환: "보조운동은 3세트면 충분"
      accessory_reps: "8-12", // 김동환: "보조는 8-12회로 볼륨"
      accessory_rpe: 7       // 김동환: "보조는 RPE 7로 가볍게"
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
    
    // 2. 김동환 코치 방식 테이블에서 찾기
    const matchingRule = DONGHWAN_COACHING_MAPPINGS.find(
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

  // 📋 김동환 코치 방식 조건키 목록
  public getAvailableConditions(): string[] {
    return DONGHWAN_COACHING_MAPPINGS.map(rule => rule.condition_key);
  }

  // ➕ 김동환님 새 훈련방식 추가 (김동환님이 직접 설정)
  public addCoachingRule(rule: UserDefinedRule): void {
    DONGHWAN_COACHING_MAPPINGS.push(rule);
  }

  // 🔄 새 조건 항목 추가 시 매핑 확장
  public expandMapping(newCondition: string, donghwanJudgment: any): void {
    // 기존 모든 조건에 새 항목 추가
    DONGHWAN_COACHING_MAPPINGS.forEach(rule => {
      const newKey = `${rule.condition_key}-${newCondition}`;
      const adjustedProtocol = this.applyDonghwanJudgment(rule.protocol, donghwanJudgment);
      
      DONGHWAN_COACHING_MAPPINGS.push({
        condition_key: newKey,
        protocol: adjustedProtocol
      });
    });
  }

  // 🧠 김동환님 판단 적용
  private applyDonghwanJudgment(baseProtocol: any, judgment: any): any {
    const adjusted = JSON.parse(JSON.stringify(baseProtocol));
    
    // 김동환님이 새 조건에 대해 어떻게 조정하라고 했는지 적용
    if (judgment.intensityAdjustment) {
      adjusted.squat.weight_percent += judgment.intensityAdjustment;
      adjusted.bench.weight_percent += judgment.intensityAdjustment;
      adjusted.deadlift.weight_percent += judgment.intensityAdjustment;
    }
    
    if (judgment.restAdjustment) {
      adjusted.squat.rest_minutes += judgment.restAdjustment;
      adjusted.bench.rest_minutes += judgment.restAdjustment;
      adjusted.deadlift.rest_minutes += judgment.restAdjustment;
    }
    
    return adjusted;
  }
}