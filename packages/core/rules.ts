// 🎯 규칙 시스템
export interface Rule {
  id: string;
  condition: string;
  action: 'warning' | 'error' | 'adjust';
  message: string;
  adjustments?: Record<string, any>;
}

export class RuleEngine {
  private rules: Rule[] = [];

  addRule(rule: Rule) {
    this.rules.push(rule);
  }

  evaluateRules(data: any): Rule[] {
    // TODO: 조건 평가 로직
    return [];
  }
}