import { runPipeline } from '../engine/runtime';
import { registerStage, getStagesByOrder } from '../engine/registry';
import type { Stage } from '../engine/stage.d';

// Test with empty order → fail
async function testEmptyOrder() {
  try {
    await runPipeline({}, [], true);
    throw new Error('Should have failed');
  } catch (error) {
    if (error instanceof Error && error.message === 'STRICT_FAIL') {
      console.log('✓ Empty order test passed');
    } else {
      throw error;
    }
  }
}

// Test with dummy stages → order respected
async function testOrderRespected() {
  // Create dummy stages
  const stage1: Stage = {
    id: 'stage1',
    run: async (ctx: any) => ({ ...ctx, step: 1 })
  };
  
  const stage2: Stage = {
    id: 'stage2', 
    run: async (ctx: any) => ({ ...ctx, step: 2 })
  };

  // Register stages
  registerStage(stage1);
  registerStage(stage2);

  // Get stages by order
  const stages = getStagesByOrder(['stage1', 'stage2']);
  
  // Run pipeline
  const result = await runPipeline({ initial: true }, stages, true);
  
  if (result.step === 2 && result.initial === true) {
    console.log('✓ Order respected test passed');
  } else {
    throw new Error('Order not respected');
  }
}

// Run tests
async function runTests() {
  try {
    await testEmptyOrder();
    await testOrderRespected();
    console.log('All tests passed');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

runTests();