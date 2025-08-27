// 🔧 Universal Rule Engine Schemas
// Domain-neutral rule and condition schemas

export interface RuleSchema {
  id: string;
  name: string;
  conditions: ConditionSchema[];
  actions: ActionSchema[];
  priority: number;
  enabled: boolean;
}

export interface ConditionSchema {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array';
}

export interface ActionSchema {
  type: 'set_field' | 'calculate' | 'transform' | 'validate';
  target: string;
  value: any;
  params?: Record<string, any>;
}

export interface RuleSet {
  version: string;
  rules: RuleSchema[];
  metadata?: Record<string, any>;
}

export interface EvaluationContext {
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface EvaluationResult {
  matched: boolean;
  appliedRules: string[];
  output: Record<string, any>;
  errors?: string[];
}