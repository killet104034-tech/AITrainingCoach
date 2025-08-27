/**
 * Universal Pipeline Engine Tests
 * Structure-only testing, NO domain assertions, NO numeric validation
 * Tests pipeline skeleton functionality and strict stage ordering
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, unlinkSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { UniversalPipeline } from '../engine/pipeline.js';
import { PipelineRegistry } from '../engine/registry.js';
import type { SurveyData, StageProcessor, StageContext } from '../engine/contracts.js';

// Test utilities
const createTestConfig = (stages: string[], testDir: string) => {
  const config = {
    pipeline_order: {
      version: "1.0.0",
      strict_execution: true,
      stages
    }
  };
  
  mkdirSync(join(testDir, 'spec'), { recursive: true });
  const configPath = join(testDir, 'spec', 'pipeline.order.json');
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  return configPath;
};

const createDummySurveyData = (): SurveyData => ({
  profile: {
    user_name: "test_user",
    sex_label: "test_sex",
    age_value: "test_age",
    bodyweight_value: "test_weight",
    experience_label: "test_exp",
    goal_label: "test_goal"
  },
  constraints: {
    frequency_cap: "test_freq",
    day_availability: ["test_day_1", "test_day_2"],
    timeslot_availability: ["test_slot_1"],
    exclusion_labels: ["test_exclusion"]
  },
  core_lifts: {
    topset_protocol: "test_topset",
    backoff_protocol: "test_backoff",
    leverage_label: "test_leverage",
    adaptation_label: "test_adaptation"
  },
  roles: {
    main: "test_main",
    accessory: "test_accessory",
    variation: "test_variation"
  },
  body_preferences: {
    labels: ["test_pref_1", "test_pref_2"]
  },
  body_regions: {
    upper: "test_upper",
    lower: "test_lower",
    full: "test_full"
  },
  sub_regions: {
    sub_a: "test_sub_a",
    sub_b: "test_sub_b",
    sub_c: "test_sub_c"
  },
  volume_buckets: {
    low: "test_vol_low",
    medium: "test_vol_med",
    high: "test_vol_high"
  },
  session_structure: {
    split_label: "test_split",
    role_layout_label: "test_layout",
    ma_ratio_policy: "test_ratio",
    ma_allocation_rule: "test_allocation"
  },
  variation_accessory: {
    failure_pattern_label: "test_failure",
    accessory_pool_label: "test_pool"
  },
  output: {
    plan: "test_plan",
    summary: "test_summary",
    audit: "test_audit"
  }
});

class TestStageProcessor implements StageProcessor {
  constructor(public readonly stage_id: string) {}

  async process(context: StageContext): Promise<StageContext> {
    context.stage_output = { 
      [`${this.stage_id}_processed`]: true,
      [`${this.stage_id}_test_data`]: `test_output_${this.stage_id}`
    };
    
    context.audit_log.push({
      stage_id: this.stage_id,
      timestamp: new Date().toISOString(),
      action: 'test_process',
      input_keys: Object.keys(context.input_data),
      output_keys: this.get_output_keys(),
      metadata: { test_processor: true }
    });

    return context;
  }

  validate_input(): boolean {
    return true;
  }

  get_output_keys(): string[] {
    return [`${this.stage_id}_processed`, `${this.stage_id}_test_data`];
  }
}

describe('UniversalPipeline', () => {
  let testDir: string;
  let registry: PipelineRegistry;

  beforeEach(() => {
    testDir = `/tmp/pipeline-test-${Date.now()}`;
    mkdirSync(testDir, { recursive: true });
    registry = PipelineRegistry.getInstance();
    registry.clear();
  });

  afterEach(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Configuration Loading', () => {
    it('should STRICT_FAIL on empty order.json', () => {
      const configPath = createTestConfig([], testDir);
      
      expect(() => new UniversalPipeline(configPath)).toThrow('STRICT_FAIL: Empty stages array');
    });

    it('should STRICT_FAIL on missing pipeline_order', () => {
      const configPath = join(testDir, 'spec', 'pipeline.order.json');
      mkdirSync(join(testDir, 'spec'), { recursive: true });
      writeFileSync(configPath, JSON.stringify({ invalid: true }));
      
      expect(() => new UniversalPipeline(configPath)).toThrow('STRICT_FAIL: Missing pipeline_order');
    });

    it('should load valid configuration', () => {
      const stages = ['S0_intake', 'S1_normalize'];
      const configPath = createTestConfig(stages, testDir);
      
      const pipeline = new UniversalPipeline(configPath);
      expect(pipeline.getStageOrder()).toEqual(stages);
    });
  });

  describe('Stage Execution Order', () => {
    it('should execute all S0-S17 stages in strict order', async () => {
      const expectedStages = [
        'S0_intake', 'S1_normalize', 'S2_constraints', 'S3_goal_policy',
        'S4_corelifts', 'S5_role', 'S6_body_pref', 'S7_body_region',
        'S8_sub_region', 'S9_volume_bucket', 'S10_session_structure',
        'S11_variation_map', 'S12_distribution', 'S13_protocol',
        'S14_progression', 'S15_deload', 'S16_validate', 'S17_emit'
      ];

      const configPath = createTestConfig(expectedStages, testDir);
      const pipeline = new UniversalPipeline(configPath);

      // Register test processors for each stage
      expectedStages.forEach(stageId => {
        pipeline.registerProcessor(stageId, new TestStageProcessor(stageId));
      });

      const surveyData = createDummySurveyData();
      const result = await pipeline.execute(surveyData);

      expect(result.success).toBe(true);
      expect(result.audit_trail).toHaveLength(expectedStages.length * 2); // 2 audit entries per stage

      // Verify stage order in audit trail
      const stageExecutionOrder = result.audit_trail
        .filter(entry => entry.action === 'test_process')
        .map(entry => entry.stage_id);

      expect(stageExecutionOrder).toEqual(expectedStages);
    });

    it('should validate stage order correctly', () => {
      const correctOrder = ['S0_intake', 'S1_normalize', 'S2_constraints'];
      const configPath = createTestConfig(correctOrder, testDir);
      const pipeline = new UniversalPipeline(configPath);

      expect(pipeline.validateStageOrder(correctOrder)).toBe(true);
      expect(pipeline.validateStageOrder(['S1_normalize', 'S0_intake', 'S2_constraints'])).toBe(false);
      expect(pipeline.validateStageOrder(['S0_intake', 'S1_normalize'])).toBe(false);
    });
  });

  describe('Audit Trail Preservation', () => {
    it('should preserve audit logs throughout pipeline execution', async () => {
      const stages = ['S0_intake', 'S1_normalize', 'S2_constraints'];
      const configPath = createTestConfig(stages, testDir);
      const pipeline = new UniversalPipeline(configPath);

      stages.forEach(stageId => {
        pipeline.registerProcessor(stageId, new TestStageProcessor(stageId));
      });

      const surveyData = createDummySurveyData();
      const result = await pipeline.execute(surveyData);

      expect(result.success).toBe(true);
      expect(result.audit_trail.length).toBeGreaterThan(0);

      // Verify all stages have audit entries
      stages.forEach(stageId => {
        const stageAudits = result.audit_trail.filter(entry => entry.stage_id === stageId);
        expect(stageAudits.length).toBeGreaterThan(0);
      });

      // Verify audit entries have required structure (no domain assertions)
      result.audit_trail.forEach(entry => {
        expect(entry).toHaveProperty('stage_id');
        expect(entry).toHaveProperty('timestamp');
        expect(entry).toHaveProperty('action');
        expect(entry).toHaveProperty('input_keys');
        expect(entry).toHaveProperty('output_keys');
        expect(entry).toHaveProperty('metadata');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing processor gracefully', async () => {
      const stages = ['S0_intake', 'S1_normalize'];
      const configPath = createTestConfig(stages, testDir);
      const pipeline = new UniversalPipeline(configPath);

      // Clear all default processors and only register processor for first stage
      pipeline.clearProcessors();
      pipeline.registerProcessor('S0_intake', new TestStageProcessor('S0_intake'));

      const surveyData = createDummySurveyData();
      const result = await pipeline.execute(surveyData);

      expect(result.success).toBe(false);
      expect(result.error_message).toContain('STRICT_FAIL: No processor found for stage S1_normalize');
    });
  });
});

describe('PipelineRegistry', () => {
  let testDir: string;
  let registry: PipelineRegistry;

  beforeEach(() => {
    testDir = `/tmp/registry-test-${Date.now()}`;
    mkdirSync(testDir, { recursive: true });
    registry = PipelineRegistry.getInstance();
    registry.clear();
  });

  afterEach(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Pipeline Management', () => {
    it('should register and retrieve pipelines', () => {
      const stages = ['S0_intake', 'S1_normalize'];
      const configPath = createTestConfig(stages, testDir);
      
      const pipeline = registry.createPipeline('test-pipeline', configPath);
      
      expect(registry.getPipelineIds()).toContain('test-pipeline');
      expect(registry.getPipeline('test-pipeline')).toBe(pipeline);
    });

    it('should validate pipeline configuration', () => {
      const correctStages = [
        'S0_intake', 'S1_normalize', 'S2_constraints', 'S3_goal_policy',
        'S4_corelifts', 'S5_role', 'S6_body_pref', 'S7_body_region',
        'S8_sub_region', 'S9_volume_bucket', 'S10_session_structure',
        'S11_variation_map', 'S12_distribution', 'S13_protocol',
        'S14_progression', 'S15_deload', 'S16_validate', 'S17_emit'
      ];

      const configPath = createTestConfig(correctStages, testDir);
      const pipeline = registry.createPipeline('valid-pipeline', configPath);

      // Register processors
      correctStages.forEach(stageId => {
        registry.registerProcessor(stageId, new TestStageProcessor(stageId));
      });

      const validation = registry.validatePipelineConfiguration('valid-pipeline');
      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should detect invalid pipeline configuration', () => {
      const invalidStages = ['S0_intake', 'INVALID_STAGE', 'S17_emit'];
      const configPath = createTestConfig(invalidStages, testDir);
      
      registry.createPipeline('invalid-pipeline', configPath);
      
      const validation = registry.validatePipelineConfiguration('invalid-pipeline');
      expect(validation.valid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Registry Statistics', () => {
    it('should provide accurate registry statistics', () => {
      const stages = ['S0_intake', 'S1_normalize'];
      const configPath = createTestConfig(stages, testDir);
      
      registry.createPipeline('test-pipeline', configPath);
      registry.registerProcessor('S0_intake', new TestStageProcessor('S0_intake'));
      
      const stats = registry.getRegistryStats();
      
      expect(stats.pipelines).toBe(1);
      expect(stats.processors).toBe(1);
      expect(stats.pipeline_ids).toContain('test-pipeline');
      expect(stats.processor_ids).toContain('S0_intake');
    });
  });
});