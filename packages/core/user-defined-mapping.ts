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

// 🗂️ 김동환 코치 매핑 테이블 (김동환님만 입력 가능)
// ⚠️ 경고: AI가 임의로 수치를 정하면 절대 안 됨! 김동환님만 추가할 것!
export const DONGHWAN_COACHING_MAPPINGS: UserDefinedRule[] = [
  // 🚫 AI 금지! 김동환님이 직접 여기에 조건-수치 매핑을 추가해야 함
  // 예시 형태만 보여줌 (실제 수치는 김동환님이 입력):
  /*
  {
    condition_key: "김동환님이_정한_조건키",
    protocol: {
      squat: {
        sets: 김동환님이_정한_세트수,
        reps: 김동환님이_정한_횟수,
        weight_percent: 김동환님이_정한_중량퍼센트,
        rpe: 김동환님이_정한_RPE,
        rest_minutes: 김동환님이_정한_휴식시간
      },
      // 벤치, 데드리프트도 김동환님이 직접...
    }
  }
  */
];

export class UserDefinedMapper {
  
  // 🎯 설문 조건을 김동환님 정의 수치로 매핑 (AI 수치 생성 금지!)
  public mapToUserDefinedProtocol(surveyData: any): UserDefinedRule | null {
    // 1. 설문 데이터에서 조건 키 생성
    const conditionKey = this.buildConditionKey(surveyData);
    
    // 2. 김동환 코치 방식 테이블에서 찾기
    const matchingRule = DONGHWAN_COACHING_MAPPINGS.find(
      rule => rule.condition_key === conditionKey
    );
    
    console.log(`🔍 [김동환매퍼] 조건키: ${conditionKey}`);
    console.log(`📋 [김동환매퍼] 매칭결과: ${matchingRule ? '김동환님 수치 발견' : '김동환님이 아직 입력 안함'}`);
    
    // ⚠️ 중요: 매칭되는 규칙이 없으면 null 반환 (AI가 임의로 만들면 안 됨!)
    if (!matchingRule) {
      console.log(`❌ [김동환매퍼] 조건키 "${conditionKey}"에 대한 김동환님의 수치가 없습니다.`);
      console.log(`💡 [김동환매퍼] 김동환님께 해당 조건의 훈련 방식을 문의하세요.`);
    }
    
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

  // 🚫 AI 수치 생성 절대 금지 함수들 삭제됨
  // 김동환님이 직접 addCoachingRule()로만 추가 가능
}