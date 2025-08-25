// 🤖 Generate: AI를 활용한 ProgramPlan 생성
import { openai } from '../openai';
import type { UserProfile } from './ingest';
import type { ProgramPlan } from './plan';

// WorkoutProgram 타입 정의 (기존 스키마와 호환)
export interface WorkoutProgram {
  id: string;
  title: string;
  description: string;
  total_weeks: number;
  training_blocks: TrainingBlock[];
  created_at: string;
  updated_at: string;
}

export interface TrainingBlock {
  block_number: number;
  block_name: string;
  weeks: number;
  focus: string;
  weeks?: WorkoutWeek[];
}

export interface WorkoutWeek {
  week_number: number;
  days: WorkoutDay[];
}

export interface WorkoutDay {
  day_number: number;
  day_type: string;
  exercises: Exercise[];
}

export interface Exercise {
  name: string;
  sets: number | string;
  reps: number | string;
  weight: string;
  rpe?: number | string;
  rest: string;
  notes?: string;
}

export interface GenerateResult {
  program: WorkoutProgram;
  metadata: ProgramMetadata;
  aiResponse: string;
}

export interface ProgramMetadata {
  generatedAt: string;
  modelUsed: string;
  promptVersion: string;
  processingTime: number;
  confidence: number;
}

// 🎯 AI 기반 프로그램 생성
export async function generateProgram(
  userProfile: UserProfile, 
  programPlan: ProgramPlan
): Promise<GenerateResult> {
  console.log('🤖 Generate 단계 시작: AI 프로그램 생성...');
  
  const startTime = Date.now();
  
  try {
    // 1. AI 프롬프트 생성
    const prompt = createAiPrompt(userProfile, programPlan);
    
    // 2. OpenAI API 호출
    const aiResponse = await callOpenAI(prompt);
    
    // 3. AI 응답 파싱
    const program = parseAiResponse(aiResponse);
    
    // 4. 메타데이터 생성
    const metadata = createMetadata(startTime);
    
    console.log('✅ Generate 완료: AI 프로그램 생성 성공');
    
    return {
      program,
      metadata,
      aiResponse
    };
    
  } catch (error) {
    console.log('❌ Generate 실패:', error);
    throw error;
  }
}

// 📝 AI 프롬프트 생성
function createAiPrompt(userProfile: UserProfile, programPlan: ProgramPlan): string {
  const { demographics, experience, goals, constraints } = userProfile;
  const { volume, frequency, intensity, periodization } = programPlan;
  
  return `
당신은 세계적 수준의 파워리프팅 코치입니다. 다음 정보를 바탕으로 개인맞춤 18주 파워리프팅 트레이닝 프로그램을 한국어로 생성해주세요.

## 사용자 프로필
**개인정보:**
- 나이: ${demographics.age}세
- 성별: ${demographics.gender}
- 체중: ${demographics.weight}kg
- 신장: ${demographics.height}cm

**운동 경험:**
- 훈련 경력: ${experience.years}년
- 수준: ${experience.level}
- 현재 1RM: 스쿼트 ${experience.currentMax.squat}kg, 벤치 ${experience.currentMax.bench}kg, 데드리프트 ${experience.currentMax.deadlift}kg

**목표 및 제약:**
- 주요 목표: ${goals.primary}
- 우선순위: ${goals.priority}
- 주당 훈련일: ${constraints.daysPerWeek}일
- 부상 이력: ${constraints.injuryHistory}
- 1회 운동시간: ${constraints.timeAvailable}분

## 수치화된 계획
**볼륨:** 주당 총 ${volume.totalSets}세트 (스쿼트 ${volume.setsPerLift.squat}, 벤치 ${volume.setsPerLift.bench}, 데드리프트 ${volume.setsPerLift.deadlift}세트)
**빈도:** 스쿼트 ${frequency.liftFrequency.squat}회/주, 벤치 ${frequency.liftFrequency.bench}회/주, 데드리프트 ${frequency.liftFrequency.deadlift}회/주
**강도:** 평균 ${intensity.averageIntensity.toFixed(1)}% (가벼운 운동 ${intensity.intensityRanges.light}%, 중간 강도 ${intensity.intensityRanges.moderate}%, 고강도 ${intensity.intensityRanges.heavy}%, 최대강도 ${intensity.intensityRanges.maximal}%)

## 피리어다이제이션
${periodization.blocks.map(block => `**${block.name}** (${block.weeks}주): ${block.focus} - ${block.characteristics}`).join('\n')}

## 요구사항
1. 정확히 18주간의 프로그램을 3개 블록으로 구성
2. 각 블록은 6주씩, 명확한 목적과 특성을 가짐
3. 주차별 운동, 세트, 반복수, 중량(%), RPE, 휴식시간 명시
4. 보조운동 포함하여 완전한 프로그램 구성
5. 점진적 부하 증가와 피킹 전략 반영

## 출력 형식
다음 JSON 구조로 응답해주세요:

{
  "program_title": "프로그램 제목",
  "total_weeks": 18,
  "training_blocks": [
    {
      "block_number": 1,
      "block_name": "Block 1 - 근비대/기초",
      "weeks": 6,
      "focus": "볼륨 & 기술",
      "weeks": [
        {
          "week_number": 1,
          "days": [
            {
              "day_number": 1,
              "day_type": "상체",
              "exercises": [
                {
                  "name": "벤치프레스",
                  "sets": 4,
                  "reps": "8-10",
                  "weight": "70%",
                  "rpe": 7,
                  "rest": "3분",
                  "notes": "폼에 집중, 완전한 가동범위"
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "program_notes": "프로그램 전반적인 주의사항과 팁"
}

완전하고 상세한 18주 프로그램을 생성해주세요.
`;
}

// 🌐 OpenAI API 호출
async function callOpenAI(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "당신은 세계적 수준의 파워리프팅 전문 코치입니다. 과학적 근거를 바탕으로 개인맞춤 트레이닝 프로그램을 설계합니다."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.log('OpenAI API 호출 실패:', error);
    throw new Error('AI 프로그램 생성 실패');
  }
}

// 📊 AI 응답 파싱
function parseAiResponse(aiResponse: string): WorkoutProgram {
  try {
    // JSON 블록 추출
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                     aiResponse.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('AI 응답에서 JSON을 찾을 수 없습니다');
    }
    
    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonStr);
    
    // WorkoutProgram 형식으로 변환
    return {
      id: generateProgramId(),
      title: parsed.program_title || '개인맞춤 파워리프팅 프로그램',
      description: parsed.program_notes || '',
      total_weeks: parsed.total_weeks || 18,
      training_blocks: parsed.training_blocks || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.log('AI 응답 파싱 실패:', error);
    
    // 폴백: 기본 프로그램 생성
    return createFallbackProgram();
  }
}

// 📋 메타데이터 생성
function createMetadata(startTime: number): ProgramMetadata {
  return {
    generatedAt: new Date().toISOString(),
    modelUsed: 'gpt-4o',
    promptVersion: '1.0',
    processingTime: Date.now() - startTime,
    confidence: 0.95
  };
}

// 🔧 보조 함수들
function generateProgramId(): string {
  return `program_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createFallbackProgram(): WorkoutProgram {
  console.log('⚠️ AI 응답 파싱 실패, 기본 프로그램 사용');
  
  return {
    id: generateProgramId(),
    title: '기본 파워리프팅 프로그램',
    description: '18주 기본 파워리프팅 트레이닝 프로그램',
    total_weeks: 18,
    training_blocks: [
      {
        block_number: 1,
        block_name: 'Block 1 - 기초/근비대',
        weeks: 6,
        focus: '볼륨 & 기술',
        weeks: [
          {
            week_number: 1,
            days: [
              {
                day_number: 1,
                day_type: '상체',
                exercises: [
                  {
                    name: '벤치프레스',
                    sets: 4,
                    reps: '8-10',
                    weight: '70%',
                    rpe: 7,
                    rest: '3분',
                    notes: '기본 기술 습득에 집중'
                  },
                  {
                    name: '바벨로우',
                    sets: 3,
                    reps: '8-10',
                    weight: '70%',
                    rpe: 7,
                    rest: '2-3분',
                    notes: '등 근육 균형 발달'
                  }
                ]
              },
              {
                day_number: 2,
                day_type: '하체',
                exercises: [
                  {
                    name: '스쿼트',
                    sets: 4,
                    reps: '8-10',
                    weight: '70%',
                    rpe: 7,
                    rest: '3-4분',
                    notes: '깊은 스쿼트 자세 연습'
                  },
                  {
                    name: '데드리프트',
                    sets: 3,
                    reps: '5-6',
                    weight: '75%',
                    rpe: 8,
                    rest: '4-5분',
                    notes: '힙힌지 동작 완성'
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}