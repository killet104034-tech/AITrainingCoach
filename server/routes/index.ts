import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "../storage";
import { registerSurveyRoutes } from "./surveys";

export async function registerRoutes(app: Express): Promise<Server> {
  // Survey routes registration (domain-neutral architecture)
  registerSurveyRoutes(app);
  
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