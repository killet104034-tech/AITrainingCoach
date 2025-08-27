// 🎯 Universal Rule Engine Evaluator
// Domain-neutral rule evaluation engine

import { RuleSchema, ConditionSchema, ActionSchema, EvaluationContext, EvaluationResult, RuleSet } from './schemas.js';

export class RuleEvaluator {
  private rules: RuleSchema[] = [];

  constructor(ruleSet?: RuleSet) {
    if (ruleSet) {
      this.loadRules(ruleSet);
    }
  }

  loadRules(ruleSet: RuleSet): void {
    this.rules = ruleSet.rules.filter(rule => rule.enabled);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  evaluate(context: EvaluationContext): EvaluationResult {
    const result: EvaluationResult = {
      matched: false,
      appliedRules: [],
      output: { ...context.data },
      errors: []
    };

    for (const rule of this.rules) {
      try {
        if (this.evaluateConditions(rule.conditions, context.data)) {
          this.applyActions(rule.actions, result.output);
          result.appliedRules.push(rule.id);
          result.matched = true;
        }
      } catch (error) {
        result.errors?.push(`Rule ${rule.id}: ${(error as Error).message}`);
      }
    }

    return result;
  }

  private evaluateConditions(conditions: ConditionSchema[], data: Record<string, any>): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(data, condition.field);
      return this.evaluateCondition(fieldValue, condition);
    });
  }

  private evaluateCondition(fieldValue: any, condition: ConditionSchema): boolean {
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  private applyActions(actions: ActionSchema[], output: Record<string, any>): void {
    for (const action of actions) {
      switch (action.type) {
        case 'set_field':
          this.setFieldValue(output, action.target, action.value);
          break;
        case 'calculate':
          this.calculateField(output, action.target, action.value, action.params);
          break;
        case 'transform':
          this.transformField(output, action.target, action.value, action.params);
          break;
        case 'validate':
          this.validateField(output, action.target, action.value, action.params);
          break;
      }
    }
  }

  private getFieldValue(data: Record<string, any>, field: string): any {
    const keys = field.split('.');
    let value = data;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  }

  private setFieldValue(data: Record<string, any>, field: string, value: any): void {
    const keys = field.split('.');
    const lastKey = keys.pop()!;
    let current = data;
    
    for (const key of keys) {
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  }

  private calculateField(data: Record<string, any>, target: string, formula: string, params?: Record<string, any>): void {
    // Simple calculation support - can be extended
    try {
      const result = this.evaluateFormula(formula, data, params);
      this.setFieldValue(data, target, result);
    } catch (error) {
      throw new Error(`Calculation failed for ${target}: ${(error as Error).message}`);
    }
  }

  private transformField(data: Record<string, any>, target: string, transformer: string, params?: Record<string, any>): void {
    const currentValue = this.getFieldValue(data, target);
    let transformedValue = currentValue;

    switch (transformer) {
      case 'uppercase':
        transformedValue = String(currentValue).toUpperCase();
        break;
      case 'lowercase':
        transformedValue = String(currentValue).toLowerCase();
        break;
      case 'round':
        transformedValue = Math.round(Number(currentValue));
        break;
      default:
        throw new Error(`Unknown transformer: ${transformer}`);
    }

    this.setFieldValue(data, target, transformedValue);
  }

  private validateField(data: Record<string, any>, target: string, validator: string, params?: Record<string, any>): void {
    const value = this.getFieldValue(data, target);
    
    switch (validator) {
      case 'required':
        if (value === undefined || value === null || value === '') {
          throw new Error(`Field ${target} is required`);
        }
        break;
      case 'min':
        if (params?.min !== undefined && Number(value) < params.min) {
          throw new Error(`Field ${target} must be at least ${params.min}`);
        }
        break;
      case 'max':
        if (params?.max !== undefined && Number(value) > params.max) {
          throw new Error(`Field ${target} must be at most ${params.max}`);
        }
        break;
    }
  }

  private evaluateFormula(formula: string, data: Record<string, any>, params?: Record<string, any>): any {
    // Simple formula evaluation - can be extended with a proper expression parser
    // For now, support basic arithmetic with field references
    let expression = formula;
    
    // Replace field references like {field.name} with actual values
    expression = expression.replace(/\{([^}]+)\}/g, (match, fieldName) => {
      const value = this.getFieldValue(data, fieldName);
      return String(value || 0);
    });
    
    // Replace parameter references like $param
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        expression = expression.replace(new RegExp(`\\$${key}`, 'g'), String(value));
      }
    }
    
    // Basic safety check - only allow numbers, operators, and parentheses
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
      throw new Error('Invalid formula expression');
    }
    
    try {
      return Function(`"use strict"; return (${expression})`)();
    } catch (error) {
      throw new Error(`Formula evaluation failed: ${(error as Error).message}`);
    }
  }
}