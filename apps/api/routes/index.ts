import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "../storage";
import { registerDebugRoutes } from "./debug";
import { registerSurveyRoutes } from "./surveys";
import { registerJobRoutes } from "./jobs";
import { registerV2Routes } from "./v2-surveys";
import { registerEvaluateRoutes } from "./evaluate";

export async function registerRoutes(app: Express): Promise<Server> {
  // Debug routes registration
  registerDebugRoutes(app);
  
  // Survey routes registration (domain-neutral architecture)
  registerSurveyRoutes(app);
  
  // Rule evaluation routes registration
  registerEvaluateRoutes(app);
  
  // V2 modular API routes registration
  registerV2Routes(app);
  
  // Job status routes registration
  registerJobRoutes(app);
  
  // Serve attached assets (images, etc.) statically
  app.use('/api/assets', express.static(path.resolve(import.meta.dirname, '..', 'attached_assets')));

  // Content retrieval endpoint (legacy)
  app.get("/api/content/:id", async (req, res) => {
    try {
      const contentId = req.params.id;
      const surveyResponse = await storage.getSurveyResponseById(contentId);
      
      if (!surveyResponse?.generatedContent) {
        return res.status(404).json({
          success: false,
          error: "Content not found"
        });
      }
      
      res.json({
        success: true,
        content: surveyResponse.generatedContent
      });
    } catch (error) {
      console.error("Content retrieval error:", error);
      res.status(500).json({
        success: false,
        error: "Error occurred while retrieving content"
      });
    }
  });

  // Create server
  const server = createServer(app);
  return server;
}