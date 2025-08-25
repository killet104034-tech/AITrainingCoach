// ⚙️ Engine Layer - planFromTables(), guards, split, variations

import { type CanonicalSurvey, type ProgramPlan, type Warning, SAFETY_LIMITS } from '../domain/index';

// 🎯 엔진 설정
export interface EngineConfig {
  version: string;
  rulesPath: string;
  enableGuards: boolean;
  enableVariations: boolean;
}

// 📊 룰 테이블 구조 (JSON에서 로드)
export interface WeeklyRules {
  week: number;
  blockType: 'work_capacity' | 'strength' | 'peaking' | 'technique';
  frequency: Record<string, number>; // 운동별 빈도
  intensityRange: [number, number]; // [min%, max%]
  volumeMultiplier: number;
  focus: string;
}

export interface ExerciseVariation {
  name: string;
  category: 'squat' | 'bench' | 'deadlift' | 'accessory';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  contraindications: string[]; // 부상시 피해야 할 것들
}

// 🛡️ 안전 가드
export interface SafetyGuard {
  name: string;
  condition: (survey: CanonicalSurvey, plan: Partial<ProgramPlan>) => boolean;
  correction: (survey: CanonicalSurvey, plan: Partial<ProgramPlan>) => void;
  warning: string;
}

// 🔧 프로그램 엔진 메인 클래스
export class ProgramEngine {
  private config: EngineConfig;
  private weeklyRules: WeeklyRules[] = [];
  private exerciseVariations: ExerciseVariation[] = [];
  private safetyGuards: SafetyGuard[] = [];
  
  constructor(config: EngineConfig) {
    this.config = config;
    this.initializeGuards();
  }
  
  // 📊 규칙 테이블에서 계획 생성
  async planFromTables(canonical: CanonicalSurvey): Promise<ProgramPlan> {
    console.log(`🔧 엔진 ${this.config.version}로 프로그램 생성 시작...`);
    
    // 1. 기본 구조 설정
    const totalWeeks = this.calculateTotalWeeks(canonical);
    const programPlan: Partial<ProgramPlan> = {
      programTitle: this.generateTitle(canonical),
      totalWeeks,
      overview: this.generateOverview(canonical),
      userMaxes: {
        squat: canonical.squatMax,
        bench: canonical.benchMax,
        deadlift: canonical.deadliftMax,
      },
      trainingWeeks: [],
    };
    
    // 2. 주차별 계획 생성
    for (let week = 1; week <= totalWeeks; week++) {
      const weekRules = this.getWeekRules(week, canonical);
      const trainingWeek = this.generateWeek(week, weekRules, canonical);
      programPlan.trainingWeeks!.push(trainingWeek);
    }
    
    // 3. 가이드라인 생성
    programPlan.progressionNotes = this.generateProgressionNotes(canonical);
    programPlan.warmupProtocol = this.generateWarmupProtocol(canonical);
    programPlan.cooldownProtocol = this.generateCooldownProtocol(canonical);
    programPlan.safetyGuidelines = this.generateSafetyGuidelines(canonical);
    programPlan.nutritionGuidelines = this.generateNutritionGuidelines(canonical);
    programPlan.recoveryGuidelines = this.generateRecoveryGuidelines(canonical);
    
    // 4. 안전 가드 적용
    const warnings: Warning[] = [];
    if (this.config.enableGuards) {
      this.applySafetyGuards(canonical, programPlan, warnings);
    }
    
    console.log(`✅ 엔진 프로그램 생성 완료: ${totalWeeks}주 계획`);
    
    return programPlan as ProgramPlan;
  }
  
  // 📏 총 주차 계산
  private calculateTotalWeeks(canonical: CanonicalSurvey): number {
    const baseWeeks = canonical.experience === 'beginner' ? 12 : 
                     canonical.experience === 'intermediate' ? 16 : 18;
    
    if (canonical.timeframe === '3months') return 12;
    if (canonical.timeframe === '6months') return 24;
    if (canonical.timeframe === '1year') return 48;
    
    return Math.max(
      SAFETY_LIMITS.MIN_PROGRAM_WEEKS,
      Math.min(baseWeeks, SAFETY_LIMITS.MAX_PROGRAM_WEEKS)
    );
  }
  
  // 📋 제목 생성
  private generateTitle(canonical: CanonicalSurvey): string {
    const expLevel = canonical.experience === 'beginner' ? '초급자' :
                    canonical.experience === 'intermediate' ? '중급자' : '고급자';
    const mainGoal = canonical.primaryGoal || canonical.goals[0] || 'strength';
    const goalText = mainGoal.includes('competition') ? '대회 준비' :
                    mainGoal.includes('strength') ? '근력 향상' : '개인 목표';
    
    return `${expLevel} ${goalText} 프로그램 (${canonical.frequency}일/주)`;
  }
  
  // 📝 개요 생성
  private generateOverview(canonical: CanonicalSurvey): string {
    return `
${canonical.experience} 수준의 ${canonical.frequency}일 주간 파워리프팅 프로그램입니다.
현재 최대중량 - 스쿼트: ${canonical.squatMax}kg, 벤치: ${canonical.benchMax}kg, 데드리프트: ${canonical.deadliftMax}kg
주요 목표: ${canonical.goals.join(', ')}
장비: ${canonical.equipment.join(', ')}
    `.trim();
  }
  
  // 📊 주차별 규칙 가져오기 (실제로는 JSON에서 로드)
  private getWeekRules(week: number, canonical: CanonicalSurvey): WeeklyRules {
    // 간단한 예시 (실제로는 config/rules/weeks.json에서 로드)
    const blockWeek = ((week - 1) % 4) + 1;
    const blockType = week <= 4 ? 'work_capacity' :
                     week <= 8 ? 'strength' :
                     week <= 12 ? 'peaking' : 'technique';
    
    return {
      week,
      blockType,
      frequency: {
        squat: Math.min(canonical.squatFrequency || 2, 3),
        bench: Math.min(canonical.benchFrequency || 3, 4),
        deadlift: Math.min(canonical.deadliftFrequency || 2, 2),
      },
      intensityRange: blockType === 'peaking' ? [85, 95] :
                     blockType === 'strength' ? [75, 85] : [65, 80],
      volumeMultiplier: canonical.volumeTolerance === 'high' ? 1.2 :
                       canonical.volumeTolerance === 'low' ? 0.8 : 1.0,
      focus: blockType === 'work_capacity' ? '기술과 볼륨' :
            blockType === 'strength' ? '최대근력' :
            blockType === 'peaking' ? '경쟁 준비' : '기술 완성',
    };
  }
  
  // 🏋️ 주차 프로그램 생성
  private generateWeek(week: number, rules: WeeklyRules, canonical: CanonicalSurvey): any {
    // 실제로는 복잡한 운동 배치 로직이 들어감
    return {
      week,
      focus: rules.focus,
      workouts: this.generateWorkouts(rules, canonical),
    };
  }
  
  // 💪 운동 세션 생성
  private generateWorkouts(rules: WeeklyRules, canonical: CanonicalSurvey): any[] {
    const workouts = [];
    
    for (let day = 1; day <= canonical.frequency; day++) {
      workouts.push({
        day,
        workoutName: `Day ${day}`,
        exercises: this.selectExercises(day, rules, canonical),
      });
    }
    
    return workouts;
  }
  
  // 🎯 운동 선택 (variations 적용)
  private selectExercises(day: number, rules: WeeklyRules, canonical: CanonicalSurvey): any[] {
    const exercises = [];
    
    // 메인 리프트들 배치 (간단한 예시)
    if (day === 1) { // 스쿼트 데이
      exercises.push({
        exercise: 'Back Squat',
        sets: '3',
        reps: '5',
        weightPercent: '80',
        restMinutes: '3',
        rpe: '8',
      });
    }
    
    return exercises;
  }
  
  // 🛡️ 안전 가드 초기화
  private initializeGuards(): void {
    this.safetyGuards = [
      {
        name: 'frequency_limit',
        condition: (survey, plan) => survey.frequency > SAFETY_LIMITS.MAX_WEEKLY_FREQUENCY,
        correction: (survey, plan) => {
          survey.frequency = SAFETY_LIMITS.MAX_WEEKLY_FREQUENCY;
        },
        warning: `주간 훈련 빈도가 ${SAFETY_LIMITS.MAX_WEEKLY_FREQUENCY}일로 제한되었습니다`,
      },
      {
        name: 'injury_adjustment',
        condition: (survey, plan) => survey.injuries !== 'none' && survey.frequency > 4,
        correction: (survey, plan) => {
          survey.frequency = Math.min(survey.frequency, 4);
        },
        warning: '부상 이력으로 인해 훈련 빈도가 조정되었습니다',
      },
    ];
  }
  
  // ⚡ 안전 가드 적용
  private applySafetyGuards(
    canonical: CanonicalSurvey, 
    plan: Partial<ProgramPlan>,
    warnings: Warning[]
  ): void {
    for (const guard of this.safetyGuards) {
      if (guard.condition(canonical, plan)) {
        const original = { ...canonical };
        guard.correction(canonical, plan);
        
        warnings.push({
          type: 'automatic_correction',
          rule: guard.name,
          message: guard.warning,
          original,
          corrected: { ...canonical },
        });
      }
    }
  }
  
  // 📝 가이드라인 생성 메서드들
  private generateProgressionNotes(canonical: CanonicalSurvey): string {
    return '매주 2.5-5kg씩 점진적으로 증량하며, RPE 9를 넘지 않도록 조절합니다.';
  }
  
  private generateWarmupProtocol(canonical: CanonicalSurvey): string {
    return '5분 유산소 + 동적 스트레칭 + 빈 바부터 시작하여 점진적 증량';
  }
  
  private generateCooldownProtocol(canonical: CanonicalSurvey): string {
    return '5-10분 정적 스트레칭 + 폼롤링으로 근육 이완';
  }
  
  private generateSafetyGuidelines(canonical: CanonicalSurvey): string {
    return '항상 스포터와 함께 훈련하고, 통증이 있으면 즉시 중단하세요.';
  }
  
  private generateNutritionGuidelines(canonical: CanonicalSurvey): string {
    return '충분한 단백질(체중 1kg당 1.6-2.2g)과 탄수화물 섭취를 유지하세요.';
  }
  
  private generateRecoveryGuidelines(canonical: CanonicalSurvey): string {
    return '7-9시간 수면과 충분한 휴식을 취하며, 스트레스를 관리하세요.';
  }
}

// 🏭 엔진 팩토리
export function createEngine(configPath: string = '../config'): ProgramEngine {
  const config: EngineConfig = {
    version: 'rules-v3',
    rulesPath: configPath,
    enableGuards: true,
    enableVariations: true,
  };
  
  return new ProgramEngine(config);
}