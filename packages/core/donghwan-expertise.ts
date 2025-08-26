// 🎯 김동환 코치 전문성 시스템
// 💼 김동환님이 고객들에게 실제로 적용하는 코칭 철학과 방법론

export interface CoachingPhilosophy {
  // 🏋️ 종목별 코칭 원칙
  squat_principles: {
    beginner_focus: string;
    progression_method: string;
    safety_priority: string;
  };
  bench_principles: {
    beginner_focus: string;
    progression_method: string;
    safety_priority: string;
  };
  deadlift_principles: {
    beginner_focus: string;
    progression_method: string;
    safety_priority: string;
  };
  
  // 📊 경험수준별 접근법
  experience_approach: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  
  // 🎯 목표별 우선순위
  goal_priorities: {
    strength: string;
    muscle: string;
    competition: string;
    health: string;
  };
}

// 🎓 김동환 코치의 실제 코칭 철학
export const DONGHWAN_EXPERTISE: CoachingPhilosophy = {
  squat_principles: {
    beginner_focus: "폼 완성과 점진적 중량 증가, 무릎과 허리 안전 최우선",
    progression_method: "선형 진행으로 매주 2.5kg씩 증가, 4주마다 디로드",
    safety_priority: "깊이보다는 안전한 가동범위, RPE 8 이상 금지"
  },
  bench_principles: {
    beginner_focus: "어깨 안정성과 가슴 자극 집중, 과도한 아치 금지",
    progression_method: "보수적 접근으로 주 1.25kg 증가, 보조운동 병행",
    safety_priority: "항상 스포터 있을 때만 고중량, 손목 보호 필수"
  },
  deadlift_principles: {
    beginner_focus: "힙힌지 패턴 완성, 허리 중립 유지가 중량보다 중요",
    progression_method: "주 2.5-5kg 증가 가능하지만 폼 흔들리면 중단",
    safety_priority: "라운드백 즉시 중단, 벨트 사용법 교육 필수"
  },
  
  experience_approach: {
    beginner: "안전이 최우선, 기본기 완성에 최소 6개월, 조급함 금물",
    intermediate: "약점 보완과 개별화된 접근, 블럭 주기화 도입 시점",
    advanced: "경기력 향상과 전문화, 개인 특성에 맞춘 고도화된 프로그래밍"
  },
  
  goal_priorities: {
    strength: "BIG3 집중, 보조운동 최소화, 신경계 적응 우선",
    muscle: "볼륨 증가와 다양한 자극, 보조운동 비중 확대",
    competition: "피킹과 맥스아웃 연습, 심리적 준비와 루틴 확립",
    health: "부상 예방과 전반적 체력, 재활 운동 병행"
  }
};

// 🧠 김동환님의 실제 결정 과정 시뮬레이션
export class DonghwanDecisionEngine {
  
  // 🤔 김동환님이 실제로 고민하는 순서
  public getCoachingDecision(client: any): string {
    let decision = "김동환 코치 분석:\n\n";
    
    // 1. 안전성 최우선 체크
    decision += this.safetyAssessment(client);
    
    // 2. 경험수준 파악
    decision += this.experienceAssessment(client);
    
    // 3. 목표와 현실성 매칭
    decision += this.goalRealistCheck(client);
    
    // 4. 개별 맞춤 조정
    decision += this.individualAdjustments(client);
    
    return decision;
  }
  
  private safetyAssessment(client: any): string {
    let safety = "🛡️ 안전성 검토:\n";
    
    if (client.injuries) {
      safety += `- 부상 이력: ${client.injuries} → 재활 운동 우선 필요\n`;
      safety += "- 해당 부위 자극 최소화, 점진적 복귀 계획\n";
    }
    
    if (client.experience_level === 'beginner') {
      safety += "- 초급자: 폼 교정이 최우선, 중량 욕심 금물\n";
      safety += "- 첫 2주는 바벨 무게로만 연습\n";
    }
    
    safety += "\n";
    return safety;
  }
  
  private experienceAssessment(client: any): string {
    let exp = "📊 경험수준 분석:\n";
    
    const expertise = DONGHWAN_EXPERTISE.experience_approach[client.experience_level || 'beginner'];
    exp += `- ${client.experience_level || '초급자'}: ${expertise}\n\n`;
    
    return exp;
  }
  
  private goalRealistCheck(client: any): string {
    let goal = "🎯 목표 현실성 체크:\n";
    
    if (client.goals?.includes('competition') && client.experience_level === 'beginner') {
      goal += "- 경고: 초급자가 대회 목표는 너무 성급함\n";
      goal += "- 제안: 먼저 기본기 6개월 완성 후 재평가\n";
    }
    
    const primaryGoal = client.goals?.[0] || 'strength';
    const goalApproach = DONGHWAN_EXPERTISE.goal_priorities[primaryGoal];
    goal += `- ${primaryGoal} 목표: ${goalApproach}\n\n`;
    
    return goal;
  }
  
  private individualAdjustments(client: any): string {
    let adj = "⚙️ 개별 맞춤 조정:\n";
    
    if (client.available_days?.length < 3) {
      adj += "- 훈련일 부족: 전신운동으로 조정 필요\n";
    }
    
    if (client.equipment_limitations) {
      adj += `- 장비 제약: ${client.equipment_limitations} → 대체 운동 적용\n`;
    }
    
    adj += "- 최종 결론: 위 모든 요소를 고려한 맞춤 프로그램 적용\n";
    
    return adj;
  }
}