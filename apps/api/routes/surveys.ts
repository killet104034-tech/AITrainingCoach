// 📋 Survey API Router - Domain Neutral Version
// ✨ Function: POST /api/surveys survey submission processing
// 🔄 Flow: survey validation → storage → content generation → email delivery

import type { Express } from "express";
import { storage } from "./storage";
import { insertSurveyResponseSchema } from "@shared/schema";
// Commented out services that need to be created/updated
// import { sendGeneratedContent } from "./services/email";
// import { createContentSheet } from "./sheets/sheetsService";
// import { operationalGuardMiddleware, operationalGuardCleanup, type GuardedRequest } from "./ops/operationalGuardMiddleware";
// import { operationalGuard, OperationalError, ErrorCategory } from "./ops/operationalGuard";

export function registerSurveyRoutes(app: Express): void {
  // TODO: Uncomment when operational guard is updated
  // app.use("/api/surveys", operationalGuardMiddleware());
  // app.use("/api/surveys", operationalGuardCleanup());
  
  // Survey submission endpoint 
  app.post("/api/surveys", async (req, res) => {
    // TODO: Add operational guard when available
    // const guardedReq = req as GuardedRequest;
    // const { auditContext } = guardedReq.guardContext;
    
    try {
      // Simplified survey data validation and storage
      const validatedData = insertSurveyResponseSchema.parse(req.body);
      const surveyResponse = await storage.createSurveyResponse(validatedData);
      
      // Basic content template (neutral design)
      const basicContent = {
        content_title: `${validatedData.name}'s Custom Content`,
        field_values: {
          field1: "100",
          field2: "80", 
          field3: "120"
        },
        content_blocks: [
          {
            block: 1,
            focus: "Basic Setup",
            items: [
              {
                day: 1,
                item_name: "Primary Activity",
                details: [
                  {
                    activity: "Activity A",
                    sets: "3",
                    reps: "8",
                    intensity_percent: "70%",
                    rest_minutes: "2-3",
                    effort_rating: "7-8",
                    notes: "Focus on form"
                  }
                ]
              }
            ]
          }
        ],
        survey_data: {
          timestamp: new Date().toISOString(),
          name: validatedData.name,
          goals: Array.isArray(validatedData.goals) ? validatedData.goals.join(', ') : '',
          email: validatedData.email
        }
      };
      
      // Update survey response with generated content
      await storage.updateSurveyResponseContent(surveyResponse.id, basicContent);
      
      // TODO: Add email functionality when service is updated
      // Send email with generated content (only if SMTP is configured)
      const canEmail = false; // Disabled for now
      // const canEmail = process.env.SMTP_USER && process.env.SMTP_PASS && validatedData.email;
      
      const responseData = {
        success: true, 
        message: canEmail 
          ? "Content successfully generated and sent via email."
          : "Content successfully generated.",
        surveyId: surveyResponse.id,
        contentUrl: `/api/content/${surveyResponse.id}`,
        emailSent: !!canEmail,
        engineVersion: 'basic-v1',
        conflictsDetected: 0,
        warnings: []
      };
      
      res.json(responseData);
      
    } catch (error) {
      console.error("Survey submission error:", error);
      
      res.status(500).json({
        success: false,
        error: "Error occurred during survey submission"
      });
    }
  });
}