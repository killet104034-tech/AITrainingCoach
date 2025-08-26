// 🚫 AI 임의 수치 생성 방지 시스템
// 김동환님만 수치를 정할 수 있도록 강제하는 가드

export class AIPreventionGuard {
  
  // 🛡️ AI가 수치를 임의로 만들려고 하면 차단
  public static preventAINumberGeneration(context: string): never {
    const errorMessage = `
🚫 AI 수치 생성 금지!

컨텍스트: ${context}

❌ AI가 임의로 숫자를 정하려고 시도했습니다.
✅ 김동환님께 직접 문의해서 정확한 수치를 받아야 합니다.

해결 방법:
1. 김동환님께 해당 조건의 훈련 방식 문의
2. 김동환님이 정한 수치를 매핑 테이블에 추가
3. 그 후 다시 프로그램 생성 시도

🎯 원칙: 모든 수치는 김동환님의 코칭 경험에서만 나와야 함!
    `;
    
    console.error(errorMessage);
    throw new Error("AI_NUMBER_GENERATION_FORBIDDEN");
  }

  // 🔍 수치가 AI 생성인지 검증
  public static validateNumberSource(number: any, source: string): void {
    if (source.includes('calculated') || 
        source.includes('estimated') || 
        source.includes('default') ||
        source.includes('AI') ||
        source.includes('automatic')) {
      
      this.preventAINumberGeneration(`의심스러운 수치 출처: ${source}`);
    }
  }

  // 📋 김동환님 입력 대기 메시지
  public static generateWaitingMessage(conditionKey: string): string {
    return `
🎯 김동환님 입력 필요

조건: ${conditionKey}

현재 상태: 김동환님이 아직 이 조건에 대한 훈련 방식을 입력하지 않았습니다.

다음 단계:
1. 김동환님께 "${conditionKey}" 조건의 고객에게 어떻게 훈련을 짜주시는지 문의
2. 김동환님의 답변을 매핑 테이블에 추가
3. 시스템에서 자동으로 해당 방식 적용

💡 잠시만요, 김동환님께 확인하겠습니다!
    `;
  }
}