/**
 * Universal Pipeline Engine - Core Pipeline Implementation
 * Structure-only execution, NO domain logic, NO numeric constraints
 * All business logic provided externally via PolicyProvider
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import type {
  StageContext,
  AuditEntry,
  PipelineResult,
  StageProcessor,
  PolicyProvider,
  PipelineConfig,
  StageId,
  SurveyData
} from './contracts.js';

export class UniversalPipeline {
  private config: PipelineConfig;
  private processors: Map<string, StageProcessor> = new Map();
  private policyProvider?: PolicyProvider;

  constructor(configPath?: string) {
    this.config = this.loadPipelineConfig(configPath);
    this.initializeDefaultProcessors();
  }

  private loadPipelineConfig(configPath?: string): PipelineConfig {
    const defaultPath = join(process.cwd(), 'spec', 'pipeline.order.json');
    const path = configPath || defaultPath;
    
    try {
      const configData = JSON.parse(readFileSync(path, 'utf8'));
      
      if (!configData.pipeline_order) {
        throw new Error('STRICT_FAIL: Missing pipeline_order in configuration');
      }
      
      if (!configData.pipeline_order.stages || configData.pipeline_order.stages.length === 0) {
        throw new Error('STRICT_FAIL: Empty stages array in pipeline configuration');
      }

      return {
        stages: configData.pipeline_order.stages,
        strict_execution: configData.pipeline_order.strict_execution ?? true,
        version: configData.pipeline_order.version || '1.0.0'
      };
    } catch (error) {
      throw new Error(`STRICT_FAIL: Failed to load pipeline configuration: ${(error as Error).message}`);
    }
  }

  private initializeDefaultProcessors(): void {
    // Initialize skeleton processors for all stages
    this.config.stages.forEach(stageId => {
      this.processors.set(stageId, new DefaultStageProcessor(stageId));
    });
  }

  public clearProcessors(): void {
    // Clear all processors (for testing missing processor scenarios)
    this.processors.clear();
  }

  public setPolicyProvider(provider: PolicyProvider): void {
    this.policyProvider = provider;
  }

  public registerProcessor(stageId: string, processor: StageProcessor): void {
    this.processors.set(stageId, processor);
  }

  public async execute(surveyData: SurveyData): Promise<PipelineResult> {
    const auditTrail: AuditEntry[] = [];
    let currentData = surveyData;
    
    try {
      // Strict stage execution in order
      for (const stageId of this.config.stages) {
        const processor = this.processors.get(stageId);
        if (!processor) {
          throw new Error(`STRICT_FAIL: No processor found for stage ${stageId}`);
        }

        const context: StageContext = {
          stage_id: stageId,
          input_data: currentData,
          stage_output: {},
          audit_log: [],
          metadata: {
            policy_provider_available: !!this.policyProvider,
            timestamp: new Date().toISOString()
          }
        };

        // Execute stage
        const processedContext = await processor.process(context);
        
        // Update current data with stage output
        currentData = { ...currentData, ...processedContext.stage_output };
        
        // Add audit entries
        auditTrail.push(...processedContext.audit_log);
        
        // Add stage completion audit
        auditTrail.push({
          stage_id: stageId,
          timestamp: new Date().toISOString(),
          action: 'stage_completed',
          input_keys: Object.keys(context.input_data),
          output_keys: processor.get_output_keys(),
          metadata: processedContext.metadata
        });
      }

      return {
        success: true,
        final_output: currentData,
        audit_trail: auditTrail
      };

    } catch (error) {
      return {
        success: false,
        final_output: {},
        audit_trail: auditTrail,
        error_message: (error as Error).message
      };
    }
  }

  public getStageOrder(): string[] {
    return [...this.config.stages];
  }

  public validateStageOrder(expectedStages: string[]): boolean {
    if (this.config.stages.length !== expectedStages.length) {
      return false;
    }
    
    return this.config.stages.every((stage, index) => stage === expectedStages[index]);
  }
}

/**
 * Default skeleton processor - passes data through with audit logging
 * Real logic provided by PolicyProvider
 */
class DefaultStageProcessor implements StageProcessor {
  constructor(public readonly stage_id: string) {}

  async process(context: StageContext): Promise<StageContext> {
    const auditEntry: AuditEntry = {
      stage_id: this.stage_id,
      timestamp: new Date().toISOString(),
      action: 'process_stage',
      input_keys: Object.keys(context.input_data),
      output_keys: this.get_output_keys(),
      metadata: {
        processor_type: 'default_skeleton',
        stage_id: this.stage_id
      }
    };

    // Skeleton processor - just passes through with audit
    context.stage_output = this.createSkeletonOutput();
    context.audit_log.push(auditEntry);

    return context;
  }

  validate_input(input: any): boolean {
    // Skeleton validation - always passes
    return true;
  }

  get_output_keys(): string[] {
    // Return stage-specific output keys
    return [`${this.stage_id}_processed`];
  }

  private createSkeletonOutput(): any {
    return {
      [`${this.stage_id}_processed`]: true,
      [`${this.stage_id}_timestamp`]: new Date().toISOString()
    };
  }
}