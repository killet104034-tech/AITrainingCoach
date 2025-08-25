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

export interface Exercise {
  exercise: string;
  sets: number;
  reps: string;
  weight_percent: string;
  rest_minutes: number;
  rpe: string;
  notes: string;
}

export interface Workout {
  day: number;
  workout_name: string;
  exercises: Exercise[];
}

export interface TrainingWeek {
  week: number;
  focus: string;
  workouts: Workout[];
}

export interface TrainingProgram {
  program_title: string;
  overview: string;
  training_weeks: TrainingWeek[];
  progression_notes: string;
  warmup_protocol: string;
  cooldown_protocol: string;
  nutrition_guidelines: string;
  recovery_guidelines: string;
  safety_guidelines: string;
}

// 기본 운동 데이터베이스
const EXERCISES = {
  squat: {
    main: [
      { name: "백 스쿼트", difficulty: "beginner" },
      { name: "프론트 스쿼트", difficulty: "intermediate" },
      { name: "하이바 스쿼트", difficulty: "beginner" },
      { name: "로우바 스쿼트", difficulty: "intermediate" }
    ],
    accessory: [
      { name: "고블릿 스쿼트", difficulty: "beginner" },
      { name: "불가리안 스플릿 스쿼트", difficulty: "intermediate" },
      { name: "레그 프레스", difficulty: "beginner" },
      { name: "런지", difficulty: "beginner" }
    ]
  },
  bench: {
    main: [
      { name: "바벨 벤치프레스", difficulty: "beginner" },
      { name: "인클라인 벤치프레스", difficulty: "intermediate" },
      { name: "덤벨 벤치프레스", difficulty: "beginner" }
    ],
    accessory: [
      { name: "덤벨 플라이", difficulty: "beginner" },
      { name: "딥스", difficulty: "intermediate" },
      { name: "오버헤드 프레스", difficulty: "intermediate" },
      { name: "푸시업", difficulty: "beginner" }
    ]
  },
  deadlift: {
    main: [
      { name: "컨벤셔널 데드리프트", difficulty: "beginner" },
      { name: "수모 데드리프트", difficulty: "intermediate" },
      { name: "루마니안 데드리프트", difficulty: "beginner" }
    ],
    accessory: [
      { name: "굿모닝", difficulty: "intermediate" },
      { name: "힙 쓰러스트", difficulty: "beginner" },
      { name: "바벨 로우", difficulty: "intermediate" },
      { name: "백 익스텐션", difficulty: "beginner" }
    ]
  }
};

// 훈련 블럭 정의
const TRAINING_BLOCKS = {
  block1_adaptation: {
    name: "블럭 1: 적응기",
    focus: "기본기 습득 및 움직임 패턴 완성",
    duration_weeks: [4, 5, 6], // 수준에 따라 선택
    intensity_range: [60, 75],
    volume: "high",
    main_goals: ["기술습득", "근지구력", "기본근력"]
  },
  block2_development: {
    name: "블럭 2: 발전기", 
    focus: "근력 증가 및 볼륨 향상",
    duration_weeks: [5, 6, 7, 8],
    intensity_range: [70, 85],
    volume: "moderate-high",
    main_goals: ["근력증가", "근비대", "기술향상"]
  },
  block3_intensification: {
    name: "블럭 3: 강화기",
    focus: "최대 강도 훈련 및 신경계 적응", 
    duration_weeks: [4, 5, 6],
    intensity_range: [80, 95],
    volume: "moderate",
    main_goals: ["최대근력", "신경계적응", "기술완성"]
  },
  block4_peaking: {
    name: "블럭 4: 피킹기",
    focus: "대회 준비 및 최대 능력 발휘",
    duration_weeks: [2, 3, 4],
    intensity_range: [85, 100],
    volume: "low",
    main_goals: ["최대발휘", "회복", "기술정교화"]
  }
};

// 프로그램 템플릿 (블럭 기반)
const PROGRAM_TEMPLATES = {
  beginner_2day: {
    title: "초보자 2일 기초 프로그램",
    overview: "파워리프팅 3대 운동의 기본기를 다지는 초보자용 프로그램입니다.",
    workouts_per_week: 2,
    blocks: ["block1_adaptation", "block2_development"],
    block_duration: [6, 6] // 각 블럭별 주차
  },
  beginner_3day: {
    title: "초보자 3일 성장 프로그램", 
    overview: "주 3회 훈련으로 근력과 기술을 동시에 향상시키는 프로그램입니다.",
    workouts_per_week: 3,
    blocks: ["block1_adaptation", "block2_development"],
    block_duration: [5, 7]
  },
  intermediate_4day: {
    title: "중급자 4일 강화 프로그램",
    overview: "중급자를 위한 체계적인 강도 증가와 볼륨 조절 프로그램입니다.",
    workouts_per_week: 4,
    blocks: ["block1_adaptation", "block2_development", "block3_intensification"],
    block_duration: [4, 6, 5]
  },
  advanced_5day: {
    title: "고급자 5일 전문 프로그램",
    overview: "고급자를 위한 전문적인 피킹과 강도 조절 프로그램입니다.",
    workouts_per_week: 5,
    blocks: ["block1_adaptation", "block2_development", "block3_intensification", "block4_peaking"],
    block_duration: [4, 6, 4, 3]
  },
  competition_prep: {
    title: "대회 준비 특화 프로그램",
    overview: "대회 출전을 목표로 하는 선수들을 위한 전문 프로그램입니다.",
    workouts_per_week: 6,
    blocks: ["block2_development", "block3_intensification", "block4_peaking"],
    block_duration: [8, 6, 4]
  }
};

export function generateTrainingProgram(surveyData: SurveyData): string {
  // 1. 설문 데이터 분석
  const analysis = analyzeSurveyData(surveyData);
  
  // 2. 적절한 프로그램 템플릿 선택
  const template = selectProgramTemplate(analysis);
  
  // 3. 개인화된 프로그램 생성
  const program = createPersonalizedProgram(analysis, template, surveyData);
  
  return JSON.stringify(program, null, 2);
}

function analyzeSurveyData(data: SurveyData) {
  const frequency = parseInt(data.frequency);
  const experience = data.experience;
  const hasInjuries = data.injuries !== "none";
  const goals = data.goals;
  
  // 현재 최대중량으로 추정 수준 계산
  const totalKg = parseInt(data.squatMax) + parseInt(data.benchMax) + parseInt(data.deadliftMax);
  
  let strengthLevel = "beginner";
  if (experience === "intermediate" || totalKg > 400) {
    strengthLevel = "intermediate";
  }
  if (experience === "advanced" || totalKg > 600) {
    strengthLevel = "advanced";
  }
  
  return {
    experience,
    frequency,
    strengthLevel,
    hasInjuries,
    goals,
    equipment: data.equipment,
    maxes: {
      squat: parseInt(data.squatMax),
      bench: parseInt(data.benchMax),
      deadlift: parseInt(data.deadliftMax)
    }
  };
}

function selectProgramTemplate(analysis: any) {
  const { frequency, strengthLevel, goals } = analysis;
  
  // 대회 준비 목표가 있는 경우
  if (goals.includes("competition") || goals.includes("대회")) {
    return PROGRAM_TEMPLATES.competition_prep;
  }
  
  // 수준과 빈도에 따른 템플릿 선택
  if (strengthLevel === "beginner") {
    return frequency <= 2 ? PROGRAM_TEMPLATES.beginner_2day : PROGRAM_TEMPLATES.beginner_3day;
  } else if (strengthLevel === "intermediate") {
    return frequency <= 3 ? PROGRAM_TEMPLATES.beginner_3day : PROGRAM_TEMPLATES.intermediate_4day;
  } else {
    return frequency <= 4 ? PROGRAM_TEMPLATES.intermediate_4day : PROGRAM_TEMPLATES.advanced_5day;
  }
}

function createPersonalizedProgram(analysis: any, template: any, surveyData: SurveyData): TrainingProgram {
  const weeks: TrainingWeek[] = [];
  let currentWeek = 1;
  
  // 블럭별 프로그램 생성
  for (let blockIndex = 0; blockIndex < template.blocks.length; blockIndex++) {
    const blockType = template.blocks[blockIndex];
    const blockDuration = template.block_duration[blockIndex];
    const blockInfo = TRAINING_BLOCKS[blockType as keyof typeof TRAINING_BLOCKS];
    
    // 각 블럭 내 주차별 프로그램 생성
    for (let blockWeek = 1; blockWeek <= blockDuration; blockWeek++) {
      const weeklyFocus = `${blockInfo.name} - ${blockInfo.focus}`;
      const workouts: Workout[] = [];
      
      // 블럭 내 진행도 계산 (0.0 ~ 1.0)
      const blockProgress = blockWeek / blockDuration;
      
      // 주간 운동 일정 생성
      for (let day = 1; day <= template.workouts_per_week; day++) {
        const workout = createBlockWorkout(
          day, 
          analysis, 
          blockInfo, 
          blockProgress, 
          currentWeek,
          blockWeek
        );
        workouts.push(workout);
      }
      
      weeks.push({
        week: currentWeek,
        focus: weeklyFocus,
        workouts
      });
      
      currentWeek++;
    }
  }
  
  return {
    program_title: template.title,
    overview: `${template.overview} 총 ${template.blocks.length}개 블럭, ${currentWeek - 1}주 프로그램입니다.`,
    training_weeks: weeks,
    user_maxes: {
      squat: surveyData.squatMax,
      bench: surveyData.benchMax,
      deadlift: surveyData.deadliftMax
    },
    progression_notes: getProgressionNotes(analysis, template),
    warmup_protocol: getWarmupProtocol(),
    cooldown_protocol: getCooldownProtocol(),
    nutrition_guidelines: getNutritionGuidelines(analysis),
    recovery_guidelines: getRecoveryGuidelines(analysis),
    safety_guidelines: getSafetyGuidelines(analysis)
  };
}

function getWeeklyFocus(week: number, totalWeeks: number): string {
  const progress = week / totalWeeks;
  
  if (progress <= 0.3) return "적응기 - 기본기 습득";
  if (progress <= 0.6) return "발전기 - 강도 증가";
  if (progress <= 0.8) return "강화기 - 최대 강도";
  return "완성기 - 기술 완성";
}

function createBlockWorkout(
  day: number, 
  analysis: any, 
  blockInfo: any, 
  blockProgress: number, 
  currentWeek: number,
  blockWeek: number
): Workout {
  const { strengthLevel } = analysis;
  const exercises: Exercise[] = [];
  
  // 요일별 주력 운동 배정
  let mainLift = "";
  let workoutName = "";
  
  if (day === 1) {
    mainLift = "squat";
    workoutName = "스쿼트 중심 훈련";
  } else if (day === 2) {
    mainLift = "bench";
    workoutName = "벤치프레스 중심 훈련";
  } else if (day === 3) {
    mainLift = "deadlift";
    workoutName = "데드리프트 중심 훈련";
  } else if (day === 4) {
    mainLift = "squat";
    workoutName = "스쿼트 보조 훈련";
  } else {
    mainLift = "bench";
    workoutName = "상체 보조 훈련";
  }
  
  // 메인 운동 추가
  const mainExercise = getMainExercise(mainLift, analysis.strengthLevel);
  const intensity = getBlockIntensity(blockInfo, blockProgress);
  
  exercises.push({
    exercise: mainExercise,
    sets: analysis.strengthLevel === "beginner" ? 3 : 4,
    reps: intensity.reps,
    weight_percent: intensity.percentage,
    rest_minutes: 3,
    rpe: intensity.rpe,
    notes: getExerciseNotes(mainExercise, analysis.strengthLevel, blockInfo)
  });
  
  // 보조 운동 추가
  const accessoryExercises = getAccessoryExercises(mainLift, analysis.strengthLevel, blockInfo);
  exercises.push(...accessoryExercises);
  
  return {
    day,
    workout_name: workoutName,
    exercises
  };
}

function getMainExercise(liftType: string, strengthLevel: string): string {
  const exercises = EXERCISES[liftType as keyof typeof EXERCISES].main;
  return exercises.find(ex => ex.difficulty === strengthLevel)?.name || exercises[0].name;
}

function getBlockIntensity(blockInfo: any, blockProgress: number) {
  // 블럭 타입에 따른 기본 강도 범위
  const [minIntensity, maxIntensity] = blockInfo.intensity_range;
  
  // 블럭 내 진행도에 따른 강도 조절
  const currentIntensity = Math.round(minIntensity + (maxIntensity - minIntensity) * blockProgress);
  
  let percentage = `${currentIntensity}%`;
  let reps = "5";
  let rpe = "7-8";
  
  // 강도에 따른 세트/랩 조절
  if (currentIntensity <= 70) {
    reps = "6-8";
    rpe = "6-7";
  } else if (currentIntensity <= 80) {
    reps = "5";
    rpe = "7-8";
  } else if (currentIntensity <= 90) {
    reps = "3-5";
    rpe = "8-9";
  } else {
    reps = "1-3";
    rpe = "9+";
  }
  
  return { reps, percentage, rpe };
}

function getAccessoryExercises(mainLift: string, strengthLevel: string, blockInfo?: any): Exercise[] {
  const accessories = EXERCISES[mainLift as keyof typeof EXERCISES].accessory;
  const selectedExercises = accessories.slice(0, strengthLevel === "beginner" ? 2 : 3);
  
  return selectedExercises.map(ex => ({
    exercise: ex.name,
    sets: 3,
    reps: "8-12",
    weight_percent: "60-70%",
    rest_minutes: 2,
    rpe: "6-7",
    notes: "근육 발달과 기술 향상을 위한 보조 운동"
  }));
}

function getExerciseNotes(exercise: string, strengthLevel: string, blockInfo?: any): string {
  let baseNote = "";
  
  if (strengthLevel === "beginner") {
    baseNote = "정확한 자세를 우선으로 하며, 무리하지 말고 점진적으로 중량을 증가시키세요.";
  } else if (strengthLevel === "intermediate") {
    baseNote = "안정적인 자세를 유지하며 목표 강도에 맞춰 훈련하세요.";
  } else {
    baseNote = "최적의 기술과 집중력으로 최대 효과를 얻으세요.";
  }
  
  // 블럭별 추가 노트
  if (blockInfo?.name.includes("적응기")) {
    baseNote += " | 기본기 습득이 우선입니다";
  } else if (blockInfo?.name.includes("강화기")) {
    baseNote += " | 고강도 집중 훈련";
  } else if (blockInfo?.name.includes("피킹기")) {
    baseNote += " | 대회 준비 - 최대 발휘";
  }
  
  return baseNote;
}

function getProgressionNotes(analysis: any, template?: any): string {
  let notes = "";
  
  if (template?.blocks) {
    notes += `총 ${template.blocks.length}개 블럭 구성:\n`;
    template.blocks.forEach((block: string, index: number) => {
      const blockName = TRAINING_BLOCKS[block as keyof typeof TRAINING_BLOCKS]?.name || block;
      const duration = template.block_duration[index];
      notes += `- ${blockName}: ${duration}주\n`;
    });
    notes += "\n";
  }
  
  notes += `중량 진행 방법:
- 목표 반복수를 모두 완료하면 다음 주에 2.5-5kg 증가
- RPE 9를 넘지 않도록 주의
- 기술이 무너지면 중량을 낮추고 폼 교정
- 블럭 전환 시 디로드 주간 적용`;
  
  return notes;
}

function getWarmupProtocol(): string {
  return `1. 5-10분 가벼운 유산소 (트레드밀, 자전거)
2. 동적 스트레칭 (레그 스윙, 암 서클 등)
3. 빈 바벨로 운동 동작 연습
4. 점진적 중량 증가 (40% → 60% → 80% → 운동 중량)`;
}

function getCooldownProtocol(): string {
  return `1. 5분 가벼운 걷기로 심박수 안정화
2. 정적 스트레칭 (각 부위 30초씩)
3. 폼롤러를 이용한 근막 이완
4. 충분한 수분 섭취`;
}

function getNutritionGuidelines(analysis: any): string {
  if (analysis.goals.includes("muscle")) {
    return `근육 성장을 위한 영양:
- 체중 1kg당 2.2g의 단백질 섭취
- 충분한 탄수화물로 에너지 공급
- 건강한 지방 섭취 (견과류, 아보카도)
- 하루 3-4회 규칙적인 식사`;
  }
  
  return `균형잡힌 영양 섭취:
- 체중 1kg당 1.8-2.0g의 단백질
- 복합 탄수화물 중심의 식단
- 충분한 수분 섭취 (하루 2-3L)
- 운동 전후 적절한 영양 보충`;
}

function getRecoveryGuidelines(analysis: any): string {
  return `효과적인 회복을 위한 가이드:
- 충분한 수면 (하루 7-9시간)
- 운동 사이 최소 48시간 휴식
- 가벼운 활동적 회복 (산책, 요가)
- 스트레스 관리와 명상`;
}

function getSafetyGuidelines(analysis: any): string {
  let safety = `안전한 훈련을 위한 수칙:
- 충분한 웜업 필수
- 정확한 자세 우선
- 점진적 중량 증가
- 통증 시 즉시 중단`;
  
  if (analysis.hasInjuries) {
    safety += `
- 부상 부위 보호와 주의
- 필요시 의료진 상담
- 무리한 운동 금지`;
  }
  
  return safety;
}