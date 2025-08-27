// 📋 Survey API Router (Server) - Domain Neutral Version
// 🔄 Flow: survey → condition mapping → content creation → email delivery

import type { Express } from "express";
import { storage } from "../storage";
import { insertSurveyResponseSchema } from "@shared/schema";

export function registerSurveyRoutes(app: Express): void {
  // Survey submission endpoint (optimized and cleaned)
  app.post("/api/surveys", async (req, res) => {
    try {
      // 1. Survey validation and storage
      const validatedData = insertSurveyResponseSchema.parse(req.body);
      const surveyResponse = await storage.createSurveyResponse(validatedData);
      
      // 2. Content generation (condition mapping based)
      let generatedContent;
      
      try {
        // Simple basic content generation
        generatedContent = {
          content_title: `${validatedData.name}'s Basic Content`,
          field_values: {
            field1: "100",
            field2: "80", 
            field3: "120"
          },
          content_blocks: [{
            block: 1,
            focus: "Basic Setup",
            items: [{
              day: 1,
              item_name: "Primary Activity",
              details: [{
                activity: "Activity 1",
                sets: "3",
                reps: "8",
                intensity_percent: "70%",
                rest_minutes: "3min",
                effort_rating: "7",
                notes: "Mapping needed"
              }]
            }]
          }],
          metadata: {
            protocol_used: "basic",
            condition_path: "no mapping",
            customizations: [],
            source: "basic template"
          }
        };
      } catch (error) {
        console.log('Content generation error:', (error as Error).message);
      }
      
      // 3. Content storage
      await storage.updateSurveyResponseContent(surveyResponse.id, generatedContent);
      
      // 4. Email delivery (if configured)
      const canEmail = false; // Disabled for now
      // TODO: Add email service
      // const canEmail = process.env.SMTP_USER && process.env.SMTP_PASS && validatedData.email;
      
      res.json({
        success: true,
        message: canEmail ? "Content generated and email sent" : "Content generated successfully",
        surveyId: surveyResponse.id,
        contentUrl: `/api/content/${surveyResponse.id}`,
        emailSent: !!canEmail
      });
      
    } catch (error) {
      console.error('Survey submission error:', error);
      res.status(500).json({
        success: false,
        error: "Error occurred during survey submission"
      });
    }
  });
}
