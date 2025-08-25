// 🎯 완전한 15단계 설문 시뮬레이션 (40-50개 질문)
import fetch from 'node-fetch';

const FULL_SURVEY_DATA = {
  // 기본 정보 (Step 1)
  email: "killet104034@gmail.com",
  name: "김파워",
  
  // 경험 및 현재 상태 (Step 2-3)
  experience: "intermediate",
  squatMax: "180",
  benchMax: "130", 
  deadliftMax: "200",
  totalMax: "510",
  bodyweight: "85",
  competitionExperience: "local",
  lastCompetition: "6개월 전",
  
  // 목표 및 우선순위 (Step 4)
  goals: ["strength", "competition", "technique"],
  primaryGoal: "competition",
  timeframe: "6months",
  nextCompetition: "12월 지역 대회",
  
  // 훈련 빈도 및 구성 (Step 5)
  frequency: "5",
  sessionsPerWeek: "5",
  trainingDuration: "120min",
  preferredTime: "evening",
  
  // 운동별 세부 선호도 (Step 6)
  squatFrequency: "3",
  benchFrequency: "3", 
  deadliftFrequency: "2",
  accessoryPreference: "moderate",
  
  // 훈련 블럭 선호도 (Step 7)
  preferredBlocks: ["strength", "peaking", "technique"],
  blockDuration: "4weeks",
  peakingExperience: "basic",
  
  // 기술적 선호도 (Step 8)
  squatStyle: "low_bar",
  squatStance: "medium",
  benchStyle: "arch",
  deadliftStyle: "conventional",
  
  // 약점 및 강점 (Step 9)
  weakestLift: "bench",
  strongestLift: "deadlift",
  techniqueIssues: ["bench_arch", "squat_depth"],
  strengthIssues: ["chest", "triceps"],
  
  // 장비 및 환경 (Step 10)
  equipment: ["barbell", "plates", "rack", "bench", "competition_bar"],
  homeGym: "no",
  spotterAvailable: "sometimes",
  preferredEquipment: ["powerlifting_bar", "competition_plates"],
  
  // 부상 이력 (Step 11)
  injuries: "minor",
  injuryDetails: "과거 어깨 약간의 통증",
  currentPain: [],
  injuryHistory: ["shoulder"],
  
  // 회복 및 라이프스타일 (Step 12)
  sleepHours: "7",
  stressLevel: "medium",
  nutrition: "good",
  supplementation: ["protein", "creatine", "multivitamin"],
  
  // 과거 프로그램 경험 (Step 13)
  previousPrograms: ["5/3/1", "starting_strength"],
  programPreference: "block",
  volumeTolerance: "medium",
  intensityPreference: "high",
  
  // 멘탈 및 동기 (Step 14)
  motivation: "competition",
  mentalApproach: "steady",
  failureHandling: "technique_focus",
  
  // 고급 설정 (Step 15)
  periodization: "block",
  autoregulation: "rpe",
  testing: "regular",
  warmupPreference: "moderate"
};

async function testFullSurvey() {
  try {
    console.log('🎯 완전한 15단계 설문 시뮬레이션 시작...');
    console.log('📧 이메일:', FULL_SURVEY_DATA.email);
    console.log('📊 총 필드 수:', Object.keys(FULL_SURVEY_DATA).length);
    
    const response = await fetch('http://localhost:5000/api/survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(FULL_SURVEY_DATA)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('🎉 설문 제출 성공!');
      console.log('✅ 응답:', result);
      console.log('');
      console.log('🚀 다음 단계들이 자동으로 실행됩니다:');
      console.log('1. ✅ AI 개인 맞춤 프로그램 생성');
      console.log('2. ✅ Google Sheets 스프레드시트 생성');
      console.log('3. ✅ 이메일 자동 전송');
      
      if (result.programUrl) {
        console.log('');
        console.log('📋 생성된 프로그램 확인: http://localhost:5000' + result.programUrl);
      }
    } else {
      console.error('❌ 설문 제출 실패:', result);
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  testFullSurvey();
}

export { testFullSurvey, FULL_SURVEY_DATA };