/**
 * Universal Pipeline Evaluation Route
 * Structure-only evaluation endpoint, NO domain logic
 * All business rules provided via PolicyProvider
 */

import { Router, Request, Response } from 'express';
import type { SurveyData } from '../engine/contracts.js';
import { PipelineRegistry } from '../engine/registry.js';

const router = Router();

interface EvaluationRequest {
  survey_data: SurveyData;
  pipeline_id?: string;
  policy_provider_id?: string;
  audit_level?: 'minimal' | 'full';
}

interface EvaluationResponse {
  success: boolean;
  pipeline_result?: any;
  audit_trail?: any[];
  error_message?: string;
  metadata: {
    pipeline_id: string;
    policy_provider_id?: string;
    execution_time_ms: number;
    stages_completed: number;
    total_stages: number;
  };
}

/**
 * POST /evaluate - Execute survey data through pipeline
 */
router.post('/evaluate', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const registry = PipelineRegistry.getInstance();

  try {
    const evaluationRequest = req.body as EvaluationRequest;
    
    // Validate request structure
    if (!evaluationRequest.survey_data) {
      return res.status(400).json({
        success: false,
        error_message: 'Missing survey_data in request',
        metadata: {
          pipeline_id: 'unknown',
          execution_time_ms: Date.now() - startTime,
          stages_completed: 0,
          total_stages: 0
        }
      } as EvaluationResponse);
    }

    const pipelineId = evaluationRequest.pipeline_id || 'default';
    const policyProviderId = evaluationRequest.policy_provider_id;
    const auditLevel = evaluationRequest.audit_level || 'minimal';

    // Create pipeline if it doesn't exist
    let pipeline = registry.getPipeline(pipelineId);
    if (!pipeline) {
      pipeline = registry.createPipeline(pipelineId);
    }

    // Execute pipeline
    const result = await registry.executePipeline(
      pipelineId,
      evaluationRequest.survey_data,
      policyProviderId
    );

    // Prepare response based on audit level
    const response: EvaluationResponse = {
      success: result.success,
      pipeline_result: result.final_output,
      metadata: {
        pipeline_id: pipelineId,
        policy_provider_id: policyProviderId,
        execution_time_ms: Date.now() - startTime,
        stages_completed: result.audit_trail.length,
        total_stages: pipeline.getStageOrder().length
      }
    };

    if (auditLevel === 'full') {
      response.audit_trail = result.audit_trail;
    }

    if (!result.success) {
      response.error_message = result.error_message;
      return res.status(422).json(response);
    }

    res.json(response);

  } catch (error) {
    const response: EvaluationResponse = {
      success: false,
      error_message: (error as Error).message,
      metadata: {
        pipeline_id: 'unknown',
        execution_time_ms: Date.now() - startTime,
        stages_completed: 0,
        total_stages: 0
      }
    };

    res.status(500).json(response);
  }
});

/**
 * GET /evaluate/pipelines - List available pipelines
 */
router.get('/evaluate/pipelines', (req: Request, res: Response) => {
  const registry = PipelineRegistry.getInstance();
  
  res.json({
    pipelines: registry.getPipelineIds(),
    processors: registry.getProcessorIds(),
    policy_providers: registry.getPolicyProviderIds(),
    registry_stats: registry.getRegistryStats()
  });
});

/**
 * GET /evaluate/pipelines/:id/validate - Validate pipeline configuration
 */
router.get('/evaluate/pipelines/:id/validate', (req: Request, res: Response) => {
  const registry = PipelineRegistry.getInstance();
  const pipelineId = req.params.id;
  
  try {
    const validation = registry.validatePipelineConfiguration(pipelineId);
    
    res.json({
      pipeline_id: pipelineId,
      valid: validation.valid,
      issues: validation.issues,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      pipeline_id: pipelineId,
      valid: false,
      issues: [(error as Error).message],
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /evaluate/pipelines/:id/stages - Get stage execution order
 */
router.get('/evaluate/pipelines/:id/stages', (req: Request, res: Response) => {
  const registry = PipelineRegistry.getInstance();
  const pipelineId = req.params.id;
  
  try {
    const pipeline = registry.getPipeline(pipelineId);
    if (!pipeline) {
      return res.status(404).json({
        error: `Pipeline not found: ${pipelineId}`
      });
    }

    res.json({
      pipeline_id: pipelineId,
      stages: pipeline.getStageOrder(),
      stage_count: pipeline.getStageOrder().length,
      strict_order: true
    });
  } catch (error) {
    res.status(500).json({
      error: (error as Error).message
    });
  }
});

export default router;