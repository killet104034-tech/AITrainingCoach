// 🎯 조건 처리 시스템
export interface Condition {
  evaluate(data: any): boolean;
}

export class ConditionProcessor {
  static parseCondition(condition: string): Condition {
    // TODO: 조건 파싱 로직
    return {
      evaluate: () => false
    };
  }
}