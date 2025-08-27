// 🧪 Rule Engine Tests - Domain Neutral
// Test suite using synthetic neutral keys and values

import { RuleEvaluator } from '../packages/core/evaluator.js';
import { RuleSet } from '../packages/core/schemas.js';

// Test data with neutral placeholders
const testRuleSet: RuleSet = {
  version: "1.0.0",
  rules: [
    {
      id: "rule1",
      name: "Basic Field Mapping",
      priority: 100,
      enabled: true,
      conditions: [
        {
          field: "key1",
          operator: "equals",
          value: "A",
          type: "string"
        }
      ],
      actions: [
        {
          type: "set_field",
          target: "result",
          value: "valueA"
        }
      ]
    },
    {
      id: "rule2", 
      name: "Numeric Comparison",
      priority: 90,
      enabled: true,
      conditions: [
        {
          field: "key2",
          operator: "greater_than",
          value: 50,
          type: "number"
        }
      ],
      actions: [
        {
          type: "set_field",
          target: "category",
          value: "valueB"
        }
      ]
    },
    {
      id: "rule3",
      name: "Array Contains",
      priority: 80,
      enabled: true,
      conditions: [
        {
          field: "key3",
          operator: "in",
          value: ["A", "B", "C"],
          type: "string"
        }
      ],
      actions: [
        {
          type: "set_field",
          target: "group",
          value: "valueC"
        }
      ]
    }
  ]
};

// Test suite functions
export function runBasicEvaluationTests(): boolean {
  console.log('🧪 Running basic evaluation tests...');
  
  try {
    const evaluator = new RuleEvaluator(testRuleSet);
    
    // Test 1: Simple string match
    const result1 = evaluator.evaluate({
      data: { key1: "A", key2: 25 }
    });
    
    if (!result1.matched || result1.appliedRules.length !== 1 || result1.output.result !== "valueA") {
      throw new Error('Test 1 failed: String match rule');
    }
    
    // Test 2: Numeric comparison
    const result2 = evaluator.evaluate({
      data: { key1: "X", key2: 75 }
    });
    
    if (!result2.matched || result2.appliedRules.length !== 1 || result2.output.category !== "valueB") {
      throw new Error('Test 2 failed: Numeric comparison rule');
    }
    
    // Test 3: Array inclusion
    const result3 = evaluator.evaluate({
      data: { key1: "X", key2: 25, key3: "B" }
    });
    
    if (!result3.matched || result3.appliedRules.length !== 1 || result3.output.group !== "valueC") {
      throw new Error('Test 3 failed: Array inclusion rule');  
    }
    
    // Test 4: Multiple rules
    const result4 = evaluator.evaluate({
      data: { key1: "A", key2: 75, key3: "C" }
    });
    
    if (!result4.matched || result4.appliedRules.length !== 3) {
      throw new Error('Test 4 failed: Multiple rules should apply');
    }
    
    // Test 5: No rules match
    const result5 = evaluator.evaluate({
      data: { key1: "X", key2: 25, key3: "D" }
    });
    
    if (result5.matched || result5.appliedRules.length !== 0) {
      throw new Error('Test 5 failed: No rules should match');
    }
    
    console.log('✅ All basic evaluation tests passed');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
    return false;
  }
}

export function runSourceManagerTests(): boolean {
  console.log('🧪 Running source manager tests...');
  
  try {
    const { sourceManager } = await import('../packages/core/sources/index.js');
    
    // Test source resolution
    const value1 = sourceManager.resolveValue('field1', {});
    if (value1 !== 'valueA') {
      throw new Error('Source resolution failed for field1');
    }
    
    const value2 = sourceManager.resolveValue('field2', { field2: 'customB' });
    if (value2 !== 'customB') {
      throw new Error('Dynamic source resolution failed for field2');
    }
    
    console.log('✅ All source manager tests passed');
    return true;
    
  } catch (error) {
    console.error('❌ Source manager test failed:', (error as Error).message);
    return false;
  }
}

export function runAllTests(): boolean {
  console.log('🏃 Running complete test suite with neutral data...\n');
  
  const results = [
    runBasicEvaluationTests(),
    runSourceManagerTests()
  ];
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed successfully!');
    return true;
  } else {
    console.log('❌ Some tests failed');
    return false;
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests();
}