// 🎯 Universal Rule Evaluation API
// Domain-neutral rule evaluation endpoint

import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { RuleEvaluator } from '../../packages/core/evaluator.js';
import { RuleSet, EvaluationContext } from '../../packages/core/schemas.js';
import * as fs from 'fs';
import * as path from 'path';

const evaluateRequestSchema = z.object({
  data: z.record(z.any()),
  ruleSet: z.optional(z.object({
    version: z.string(),
    rules: z.array(z.any()),
    metadata: z.optional(z.record(z.any()))
  })),
  metadata: z.optional(z.record(z.any()))
});

export function registerEvaluateRoutes(app: Express): void {
  app.post("/api/evaluate", async (req: Request, res: Response) => {
    try {
      const validatedData = evaluateRequestSchema.parse(req.body);
      
      // Load default rules if none provided
      let ruleSet: RuleSet;
      if (validatedData.ruleSet) {
        ruleSet = validatedData.ruleSet;
      } else {
        const rulesPath = path.join(process.cwd(), 'rules.default.json');
        const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
        ruleSet = JSON.parse(rulesContent);
      }
      
      const evaluator = new RuleEvaluator(ruleSet);
      const context: EvaluationContext = {
        data: validatedData.data,
        metadata: validatedData.metadata
      };
      
      const result = evaluator.evaluate(context);
      
      res.json({
        success: true,
        result,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Rule evaluation error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request format',
          details: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Rule evaluation failed',
        message: (error as Error).message
      });
    }
  });

  // Health check endpoint for evaluation service
  app.get("/api/evaluate/health", (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'rule-evaluator',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Get current rules endpoint
  app.get("/api/evaluate/rules", (req: Request, res: Response) => {
    try {
      const rulesPath = path.join(process.cwd(), 'rules.default.json');
      const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
      const ruleSet = JSON.parse(rulesContent);
      
      res.json({
        success: true,
        ruleSet,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to load rules',
        message: (error as Error).message
      });
    }
  });
}