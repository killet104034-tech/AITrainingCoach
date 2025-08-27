import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

// 🎯 간소화된 설문 데이터 (복잡한 조건 매핑 제거)
export interface SurveyData {
  name?: string;
  goals?: string[];
  email?: string;
}

export async function generateContent(surveyData: SurveyData): Promise<string> {
  try {
    // Simplified prompt (domain-neutral)
    const prompt = `You are a world-class content generator. Based on the following information, create detailed personalized content in JSON format.

Survey Information:
- Name: ${surveyData.name || 'User'}
- Preferences: ${Array.isArray(surveyData.goals) ? surveyData.goals.join(', ') : 'General'}

Please respond in the following JSON format:
{
  "content_title": "${surveyData.name || 'User'}'s Custom Content",
  "overview": "Content overview description",
  "content_blocks": [
    {
      "block": 1,
      "focus": "Basic Setup",
      "items": [
        {
          "day": 1,
          "item_name": "Primary Activity",
          "details": [
            {
              "activity": "Activity 1",
              "sets": "3",
              "reps": "8",
              "intensity_percent": "70%",
              "rest_minutes": "2-3",
              "effort_rating": "7-8",
              "notes": "Focus on technique"
            }
          ]
        }
      ]
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an experienced content creator. You generate personalized content based on user preferences using scientific principles and best practices."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    return response.choices[0].message.content || "Content generation failed.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("AI content generation failed: " + (error as Error).message);
  }
}
