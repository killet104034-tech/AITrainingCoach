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

export async function generateTrainingProgram(surveyData: SurveyData): Promise<string> {
  try {
    // 🎯 간소화된 프롬프트 (복잡한 조건 매핑 제거)
    const prompt = `당신은 세계 최고의 파워리프팅 코치입니다. 다음 정보를 바탕으로 한국어로 상세한 개인 맞춤형 파워리프팅 훈련 프로그램을 작성해주세요.

설문 정보:
- 이름: ${surveyData.name || '고객'}
- 목표: ${Array.isArray(surveyData.goals) ? surveyData.goals.join(', ') : '근력 향상'}

다음 형식으로 JSON 응답해주세요:
{
  "program_title": "${surveyData.name || '고객'}님의 맞춤 훈련 프로그램",
  "overview": "프로그램 개요 설명",
  "training_weeks": [
    {
      "week": 1,
      "focus": "기본 적응",
      "workouts": [
        {
          "day": 1,
          "workout_name": "전신 운동",
          "exercises": [
            {
              "exercise": "스쿼트",
              "sets": "3",
              "reps": "8",
              "weight_percent": "70%",
              "rest_minutes": "2-3",
              "rpe": "7-8",
              "notes": "기본 폼 집중"
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
          content: "당신은 경험이 풍부한 파워리프팅 코치입니다. 과학적 근거를 바탕으로 안전하고 효과적인 훈련 프로그램을 설계합니다."
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

    return response.choices[0].message.content || "프로그램 생성에 실패했습니다.";
  } catch (error) {
    console.error("OpenAI API 오류:", error);
    throw new Error("AI 훈련 프로그램 생성에 실패했습니다: " + (error as Error).message);
  }
}
