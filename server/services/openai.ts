import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface SurveyData {
  experience: string;
  squatMax: string;
  benchMax: string;
  deadliftMax: string;
  goals: string[];
  frequency: string;
  equipment: string[];
  injuries: string;
  injuryDetails?: string;
  name?: string;
}

export async function generateTrainingProgram(surveyData: SurveyData): Promise<string> {
  try {
    const prompt = `당신은 세계 최고의 파워리프팅 코치입니다. 다음 정보를 바탕으로 한국어로 상세한 개인 맞춤형 파워리프팅 훈련 프로그램을 작성해주세요.

설문 정보:
- 경험 수준: ${surveyData.experience}
- 현재 스쿼트 1RM: ${surveyData.squatMax}kg
- 현재 벤치프레스 1RM: ${surveyData.benchMax}kg  
- 현재 데드리프트 1RM: ${surveyData.deadliftMax}kg
- 목표: ${surveyData.goals.join(', ')}
- 주당 훈련 횟수: 주 ${surveyData.frequency}회
- 사용 가능 장비: ${surveyData.equipment.join(', ')}
- 부상 이력: ${surveyData.injuries}
${surveyData.injuryDetails ? `- 부상 상세: ${surveyData.injuryDetails}` : ''}

다음 형식으로 JSON 응답해주세요:
{
  "program_title": "프로그램 제목",
  "overview": "프로그램 개요 설명",
  "weekly_schedule": [
    {
      "day": "1일차 - 스쿼트 중심",
      "exercises": [
        {
          "name": "운동명",
          "sets_reps": "세트 x 반복수",
          "weight_percentage": "1RM의 몇%",
          "notes": "주의사항"
        }
      ]
    }
  ],
  "progression_scheme": "점진적 과부하 계획",
  "warmup_routine": "웜업 루틴",
  "cooldown_routine": "쿨다운 루틴",
  "nutrition_tips": "영양 조언",
  "recovery_tips": "회복 조언",
  "safety_notes": "안전 주의사항"
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
    throw new Error("AI 훈련 프로그램 생성에 실패했습니다: " + error.message);
  }
}
