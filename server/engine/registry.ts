/**
 * Universal Pipeline Engine - Registry System
 * Manages pipeline configurations, processors, and policies
 * Structure-only registry, NO domain-specific logic
 */

import type {
  StageProcessor,
  PolicyProvider,
  PipelineConfig,
  SurveyData
} from './contracts.js';
import { UniversalPipeline } from './pipeline.js';

export class PipelineRegistry {
  private static instance: PipelineRegistry;
  private processors: Map<string, StageProcessor> = new Map();
  private policyProviders: Map<string, PolicyProvider> = new Map();
  private pipelines: Map<string, UniversalPipeline> = new Map();

  private constructor() {}

  public static getInstance(): PipelineRegistry {
    if (!PipelineRegistry.instance) {
      PipelineRegistry.instance = new PipelineRegistry();
    }
    return PipelineRegistry.instance;
  }

  /**
   * Register a stage processor
   */
  public registerProcessor(stageId: string, processor: StageProcessor): void {
    this.processors.set(stageId, processor);
  }

  /**
   * Register a policy provider
   */
  public registerPolicyProvider(providerId: string, provider: PolicyProvider): void {
    this.policyProviders.set(providerId, provider);
  }

  /**
   * Create and register a new pipeline instance
   */
  public createPipeline(pipelineId: string, configPath?: string): UniversalPipeline {
    try {
      const pipeline = new UniversalPipeline(configPath);
      
      // Register all available processors with this pipeline
      this.processors.forEach((processor, stageId) => {
        pipeline.registerProcessor(stageId, processor);
      });

      this.pipelines.set(pipelineId, pipeline);
      return pipeline;
    } catch (error) {
      throw new Error(`Failed to create pipeline ${pipelineId}: ${(error as Error).message}`);
    }
  }

  /**
   * Get a registered pipeline
   */
  public getPipeline(pipelineId: string): UniversalPipeline | undefined {
    return this.pipelines.get(pipelineId);
  }

  /**
   * Get all registered pipeline IDs
   */
  public getPipelineIds(): string[] {
    return Array.from(this.pipelines.keys());
  }

  /**
   * Get a registered processor
   */
  public getProcessor(stageId: string): StageProcessor | undefined {
    return this.processors.get(stageId);
  }

  /**
   * Get all registered processor stage IDs
   */
  public getProcessorIds(): string[] {
    return Array.from(this.processors.keys());
  }

  /**
   * Get a registered policy provider
   */
  public getPolicyProvider(providerId: string): PolicyProvider | undefined {
    return this.policyProviders.get(providerId);
  }

  /**
   * Get all registered policy provider IDs
   */
  public getPolicyProviderIds(): string[] {
    return Array.from(this.policyProviders.keys());
  }

  /**
   * Execute pipeline with policy provider
   */
  public async executePipeline(
    pipelineId: string,
    surveyData: SurveyData,
    policyProviderId?: string
  ) {
    const pipeline = this.getPipeline(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline not found: ${pipelineId}`);
    }

    if (policyProviderId) {
      const policyProvider = this.getPolicyProvider(policyProviderId);
      if (!policyProvider) {
        throw new Error(`Policy provider not found: ${policyProviderId}`);
      }
      pipeline.setPolicyProvider(policyProvider);
    }

    return await pipeline.execute(surveyData);
  }

  /**
   * Validate pipeline configuration
   */
  public validatePipelineConfiguration(pipelineId: string): {
    valid: boolean;
    issues: string[];
  } {
    const pipeline = this.getPipeline(pipelineId);
    if (!pipeline) {
      return {
        valid: false,
        issues: [`Pipeline not found: ${pipelineId}`]
      };
    }

    const issues: string[] = [];
    const expectedStages = [
      'S0_intake', 'S1_normalize', 'S2_constraints', 'S3_goal_policy',
      'S4_corelifts', 'S5_role', 'S6_body_pref', 'S7_body_region',
      'S8_sub_region', 'S9_volume_bucket', 'S10_session_structure',
      'S11_variation_map', 'S12_distribution', 'S13_protocol',
      'S14_progression', 'S15_deload', 'S16_validate', 'S17_emit'
    ];

    if (!pipeline.validateStageOrder(expectedStages)) {
      issues.push('Invalid stage order - must follow strict S0-S17 sequence');
    }

    const stageOrder = pipeline.getStageOrder();
    stageOrder.forEach(stageId => {
      if (!this.processors.has(stageId)) {
        issues.push(`Missing processor for stage: ${stageId}`);
      }
    });

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Get registry statistics
   */
  public getRegistryStats() {
    return {
      processors: this.processors.size,
      policy_providers: this.policyProviders.size,
      pipelines: this.pipelines.size,
      processor_ids: this.getProcessorIds(),
      policy_provider_ids: this.getPolicyProviderIds(),
      pipeline_ids: this.getPipelineIds()
    };
  }

  /**
   * Clear all registrations (for testing)
   */
  public clear(): void {
    this.processors.clear();
    this.policyProviders.clear();
    this.pipelines.clear();
  }
}