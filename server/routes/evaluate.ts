import type { Express } from "express";
import { readFile } from "fs/promises";
import { resolve, join } from "path";
import { getStagesByOrder } from "../engine/registry";
import { runPipeline } from "../engine/runtime";

export function registerEvaluateRoutes(app: Express): void {
  app.post("/api/evaluate", async (req, res) => {
    try {
      // Load order.json
      const orderJsonPath = join(process.cwd(), 'spec/pipeline.order.json');
      const orderJson = JSON.parse(await readFile(orderJsonPath, 'utf-8'));
      
      if (!orderJson.stages || !Array.isArray(orderJson.stages)) {
        return res.status(422).json({ error: 'STRICT_FAIL' });
      }

      // If no stages or missing stage IDs → 422 STRICT_FAIL
      if (orderJson.stages.length === 0) {
        return res.status(422).json({ error: 'STRICT_FAIL' });
      }

      // Fetch stages from registry
      const stages = getStagesByOrder(orderJson.stages);
      
      // Run pipeline
      const result = await runPipeline(req.body, stages, true);
      
      res.json({ success: true, result });
    } catch (error) {
      if (error instanceof Error && error.message === 'STRICT_FAIL') {
        return res.status(422).json({ error: 'STRICT_FAIL' });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}