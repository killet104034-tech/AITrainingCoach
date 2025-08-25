// ⚙️ Engine - 표 기반 개인화 + 시드된 가중치 선택 파워리프팅 프로그래밍

import { type CanonicalSurvey, type ProgramPlan, type Warning, SAFETY_LIMITS } from '../domain/types';

// 🔧 진짜 파워리프팅 프로그래밍 엔진 (표 기반 개인화)
export class PowerliftingProgramEngine {
  
  private volConfig: any;
  private freqConfig: any;
  private varWeights: any;
  private schemes: any;
  
  constructor() {
    // 기본 설정 즉시 로드
    this.setDefaultConfigs();
  }
  
  private async loadConfigs() {
    try {
      this.volConfig = await import('../config/rules/volume.json').then(m => m.default);
      this.freqConfig = await import('../config/rules/frequency.json').then(m => m.default);
      this.varWeights = await import('../config/rules/variationWeights.json').then(m => m.default);
      this.schemes = await import('../config/schemes/presets.json').then(m => m.default);
    } catch (error) {
      console.log('⚠️ JSON 설정 로드 실패, 기본값 사용:', error);
      this.setDefaultConfigs();
    }
  }
  
  private setDefaultConfigs() {
    this.volConfig = {
      beginnerVolume: { squat: { default: 15 }, bench: { default: 20 }, deadlift: { default: 12 } },
      intermediateVolume: { squat: { default: 20 }, bench: { default: 25 }, deadlift: { default: 14 } },
      advancedVolume: { squat: { default: 25 }, bench: { default: 30 }, deadlift: { default: 16 } },
      volumeModifiers: { highVolumeTolerance: 1.2, lowVolumeTolerance: 0.8, injuryReduction: 0.7 }
    };
    
    this.freqConfig = {
      frequencyPatterns: {
        '3day': { squat: 2, bench: 2, deadlift: 1 },
        '4day': { squat: 2, bench: 3, deadlift: 2 },
        '5day': { squat: 3, bench: 3, deadlift: 2 },
        '6day': { squat: 3, bench: 4, deadlift: 2 }
      },
      experienceMultipliers: { beginner: 0.8, intermediate: 1.0, advanced: 1.2 }
    };
    
    this.varWeights = {
      squat: { competition: { back_squat: 8, pause_squat: 5, front_squat: 2 } },
      bench: { competition: { bench_press: 8, pause_bench: 6, close_grip_bench: 4 } },
      deadlift: { competition: { conventional_deadlift: 8, sumo_deadlift: 6, romanian_deadlift: 2 } }
    };
    
    this.schemes = {
      intensitySchemes: {
        heavy: {
          squat: [{ sets: 1, reps: 1, percentage: 95, rpe: 9 }, { sets: 2, reps: 3, percentage: 85, rpe: 7 }],
          bench: [{ sets: 1, reps: 1, percentage: 95, rpe: 9 }, { sets: 3, reps: 3, percentage: 85, rpe: 7 }],
          deadlift: [{ sets: 1, reps: 1, percentage: 95, rpe: 9 }, { sets: 2, reps: 3, percentage: 85, rpe: 7 }]
        },
        moderate: {
          squat: [{ sets: 3, reps: 5, percentage: 80, rpe: 7 }, { sets: 2, reps: 8, percentage: 75, rpe: 6 }],
          bench: [{ sets: 4, reps: 5, percentage: 80, rpe: 7 }, { sets: 3, reps: 8, percentage: 75, rpe: 6 }],
          deadlift: [{ sets: 3, reps: 5, percentage: 80, rpe: 7 }, { sets: 2, reps: 8, percentage: 75, rpe: 6 }]
        },
        light: {
          squat: [{ sets: 4, reps: 8, percentage: 70, rpe: 6 }, { sets: 3, reps: 10, percentage: 65, rpe: 5 }],
          bench: [{ sets: 4, reps: 8, percentage: 70, rpe: 6 }, { sets: 3, reps: 10, percentage: 65, rpe: 5 }],
          deadlift: [{ sets: 3, reps: 8, percentage: 70, rpe: 6 }, { sets: 2, reps: 10, percentage: 65, rpe: 5 }]
        }
      },
      dayTypes: {
        '3day': ['heavy', 'moderate', 'light'],
        '4day': ['heavy', 'moderate', 'light', 'moderate'],
        '5day': ['heavy', 'moderate', 'light', 'moderate', 'light'],
        '6day': ['heavy', 'moderate', 'light', 'moderate', 'light', 'moderate']
      }
    };
  }
  
  // 📊 테이블 기반 프로그램 생성 (실제 파워리프팅 로직)
  async planFromTables(canonical: CanonicalSurvey): Promise<ProgramPlan> {
    console.log('🔥 PowerliftingProgramEngine: 실제 파워리프팅 프로그래밍 시작...');
    
    const warnings: Warning[] = [];
    
    // 1. 사용자 고유 시드 생성
    const seed = this.hash(canonical.email + canonical.experience + canonical.frequency);
    const rng = this.mulberry32(seed);
    
    // 2. 볼륨/빈도/주차% 결정 (테이블 기반)
    const volumeTargets = this.chooseSets(canonical);        // {squat:20, bench:25, deadlift:14}
    const freqTargets = this.chooseFrequency(canonical);     // {squat:2, bench:3, deadlift:2}  
    const weeklyIntensities = this.pickWeeks(canonical);     // [0.68,0.72,0.76,0.80,0.62,0.85,0.90]
    
    console.log('📊 프로그램 파라미터:', { volumeTargets, freqTargets, weekCount: weeklyIntensities.length });
    console.log('🎯 주기화 패턴:', weeklyIntensities.map((w, i) => `${i+1}주: ${Math.round(w*100)}%`).join(', '));
    
    // 3. 주차×요일 스켈레톤 생성 (Heavy/Mod/Light)
    const trainingFrame = this.splitIntoDays(volumeTargets, freqTargets, weeklyIntensities.length);
    
    // 4. 각 셀에 스킴 + 변형 운동 채우기
    const trainingWeeks = this.buildTrainingWeeks(trainingFrame, canonical, weeklyIntensities, rng, warnings);
    
    // 5. 안전 가드레일 적용
    this.applyGuards(canonical, warnings);
    
    const program: ProgramPlan = {
      programTitle: this.generateTitle(canonical),
      totalWeeks: weeklyIntensities.length,
      overview: this.generateOverview(canonical, volumeTargets, freqTargets),
      userMaxes: {
        squat: canonical.squatMax,
        bench: canonical.benchMax,
        deadlift: canonical.deadliftMax,
      },
      trainingWeeks,
      progressionNotes: this.generateProgressionNotes(),
      warmupProtocol: this.generateWarmupProtocol(),
      cooldownProtocol: this.generateCooldownProtocol(),
      safetyGuidelines: this.generateSafetyGuidelines(),
      nutritionGuidelines: this.generateNutritionGuidelines(),
      recoveryGuidelines: this.generateRecoveryGuidelines(),
    };
    
    console.log(`✅ 진짜 파워리프팅 프로그램 생성 완료: ${weeklyIntensities.length}주, ${freqTargets.squat + freqTargets.bench + freqTargets.deadlift}회/주`);
    return program;
  }
  
  // 📊 볼륨 선택 (경험별 + 선호도 반영)
  private chooseSets(canonical: CanonicalSurvey): { squat: number; bench: number; deadlift: number } {
    const expLevel = canonical.experience;
    const baseVol = this.volConfig[`${expLevel}Volume`];
    const modifier = canonical.volumeTolerance === 'high' ? 1.2 : 
                    canonical.volumeTolerance === 'low' ? 0.8 : 1.0;
    const injuryMod = canonical.injuries !== 'none' ? 0.8 : 1.0;
    
    return {
      squat: Math.round(baseVol.squat.default * modifier * injuryMod),
      bench: Math.round(baseVol.bench.default * modifier * injuryMod),
      deadlift: Math.round(baseVol.deadlift.default * modifier * injuryMod),
    };
  }
  
  // 🔄 빈도 선택 (운동별)
  private chooseFrequency(canonical: CanonicalSurvey): { squat: number; bench: number; deadlift: number } {
    const dayPattern = `${canonical.frequency}day`;
    const baseFreq = this.freqConfig.frequencyPatterns[dayPattern] || this.freqConfig.frequencyPatterns['4day'];
    const expMod = this.freqConfig.experienceMultipliers[canonical.experience] || 1.0;
    
    return {
      squat: Math.max(1, Math.round(baseFreq.squat * expMod)),
      bench: Math.max(1, Math.round(baseFreq.bench * expMod)),
      deadlift: Math.max(1, Math.round(baseFreq.deadlift * expMod)),
    };
  }
  
  // 📅 주차별 강도 결정 (실제 주기화)
  private pickWeeks(canonical: CanonicalSurvey): number[] {
    // 경험별 + 목표별 주기화 패턴
    const patterns = {
      beginner: [0.65, 0.68, 0.70, 0.73, 0.60, 0.75, 0.78, 0.80],          // 8주 리니어
      intermediate: [0.68, 0.72, 0.76, 0.80, 0.62, 0.78, 0.82, 0.85, 0.88, 0.65, 0.90, 0.95], // 12주 언듈레이팅
      advanced: [0.70, 0.75, 0.80, 0.85, 0.60, 0.82, 0.87, 0.92, 0.95, 0.65, 0.88, 0.93, 0.97, 0.70, 0.95, 0.100], // 16주 블럭
    };
    
    return patterns[canonical.experience] || patterns['intermediate'];
  }
  
  // 🏗️ 주차×요일 스켈레톤 생성 (Heavy/Mod/Light)
  private splitIntoDays(volumeTargets: any, freqTargets: any, totalWeeks: number): any[] {
    const frame = [];
    const dayTypes = this.schemes.dayTypes['4day']; // heavy, moderate, light, moderate
    
    for (let week = 1; week <= totalWeeks; week++) {
      const setsPerWeek = {
        squat: Math.round(volumeTargets.squat / freqTargets.squat),
        bench: Math.round(volumeTargets.bench / freqTargets.bench),
        deadlift: Math.round(volumeTargets.deadlift / freqTargets.deadlift),
      };
      
      for (let day = 1; day <= 4; day++) { // 4일 패턴
        const dayType = dayTypes[(day - 1) % dayTypes.length];
        
        frame.push({
          week,
          day,
          dayType,
          targets: {
            squat: day <= freqTargets.squat ? setsPerWeek.squat : 0,
            bench: day <= freqTargets.bench ? setsPerWeek.bench : 0,
            deadlift: day <= freqTargets.deadlift ? setsPerWeek.deadlift : 0,
          }
        });
      }
    }
    
    return frame;
  }
  
  // 🏋️ 훈련주차 빌드 (스킴 + 변형운동)
  private buildTrainingWeeks(frame: any[], canonical: CanonicalSurvey, weeklyIntensities: number[], rng: () => number, warnings: Warning[]): any[] {
    const weeks = [];
    const weekGroups = this.groupByWeek(frame);
    
    for (const [weekNum, days] of Object.entries(weekGroups)) {
      const week = parseInt(weekNum);
      const weekIntensity = weeklyIntensities[week - 1] || 0.75;
      const workouts = [];
      
      for (const dayFrame of days) {
        const exercises = [];
        
        // 각 운동별로 처리
        for (const lift of ['squat', 'bench', 'deadlift'] as const) {
          const sets = dayFrame.targets[lift];
          if (!sets) continue;
          
          // 변형 운동 선택
          const variation = this.weightedPick(this.varWeights[lift], canonical, rng);
          
          // 스킴 선택 및 적용
          const scheme = this.schemeByDayType(lift, dayFrame.dayType);
          const liftExercises = this.compileScheme({
            week,
            day: dayFrame.day,
            lift,
            variation,
            oneRM: this.get1RM(canonical, lift),
            sets,
            weekIntensity
          }, scheme);
          
          exercises.push(...liftExercises);
        }
        
        // 액세서리 운동 추가
        exercises.push(...this.buildAccessories(canonical, dayFrame, rng));
        
        workouts.push({
          day: dayFrame.day,
          workoutName: `${dayFrame.dayType.toUpperCase()} Day`,
          exercises
        });
      }
      
      weeks.push({
        week,
        focus: this.getWeekFocus(week, weeklyIntensities.length, weekIntensity),
        workouts
      });
    }
    
    return weeks;
  }
  
  // 🛡️ 가드 적용
  private applyGuards(canonical: CanonicalSurvey, warnings: Warning[]): void {
    // 부상자 보호
    if (canonical.injuries !== 'none') {
      warnings.push({
        type: 'safety_adjustment',
        rule: 'injury_protection',
        message: '부상 이력으로 인해 강도가 조정되었습니다',
        original: 'standard_intensity',
        corrected: 'reduced_intensity'
      });
    }
    
    // 초보자 보호
    if (canonical.experience === 'beginner') {
      warnings.push({
        type: 'safety_adjustment',
        rule: 'beginner_protection',
        message: '초보자를 위해 프로그램이 보수적으로 조정되었습니다',
        original: 'advanced_program',
        corrected: 'beginner_program'
      });
    }
  }
  
  // 📝 가이드라인 생성 메서드들
  private generateTitle(canonical: CanonicalSurvey): string {
    const level = canonical.experience === 'beginner' ? '초급' :
                 canonical.experience === 'intermediate' ? '중급' : '고급';
    return `${level} 파워리프팅 프로그램 (${canonical.frequency}일/주)`;
  }
  
  private generateOverview(canonical: CanonicalSurvey): string {
    return `${canonical.experience} 수준의 ${canonical.frequency}일 주간 파워리프팅 프로그램입니다.`;
  }
  
  private generateProgressionNotes(): string {
    return '매주 2.5-5kg씩 점진적으로 증량하며, RPE 9를 넘지 않도록 조절합니다.';
  }
  
  private generateWarmupProtocol(): string {
    return '5분 유산소 + 동적 스트레칭 + 빈 바부터 시작하여 점진적 증량';
  }
  
  private generateCooldownProtocol(): string {
    return '5-10분 정적 스트레칭 + 폼롤링으로 근육 이완';
  }
  
  private generateSafetyGuidelines(): string {
    return '항상 스포터와 함께 훈련하고, 통증이 있으면 즉시 중단하세요.';
  }
  
  private generateNutritionGuidelines(): string {
    return '충분한 단백질(체중 1kg당 1.6-2.2g)과 탄수화물 섭취를 유지하세요.';
  }
  
  private generateRecoveryGuidelines(): string {
    return '7-9시간 수면과 충분한 휴식을 취하며, 스트레스를 관리하세요.';
  }
  
  // === 유틸리티 함수들 ===
  
  // 해시 함수
  private hash(s: string): number {
    let h = 1779033703;
    for (let i = 0; i < s.length; i++) {
      h = (h ^ s.charCodeAt(i)) * 3432918353;
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }
  
  // 시드 기반 랜덤 생성기
  private mulberry32(a: number): () => number {
    return function() {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  
  // 가중치 기반 선택
  private weightedPick(table: any, canonical: CanonicalSurvey, rng: () => number): string {
    const varType = canonical.experience === 'beginner' ? 'beginner' : 'competition';
    const weights = table[varType] || table.competition;
    
    const total = Object.values(weights).reduce((a: any, b: any) => a + b, 0);
    let r = rng() * total;
    
    for (const [k, w] of Object.entries(weights)) {
      if ((r -= Number(w)) <= 0) return k;
    }
    
    return Object.keys(weights)[0];
  }
  
  // 1RM 가져오기
  private get1RM(canonical: CanonicalSurvey, lift: 'squat' | 'bench' | 'deadlift'): number {
    switch (lift) {
      case 'squat': return canonical.squatMax;
      case 'bench': return canonical.benchMax;
      case 'deadlift': return canonical.deadliftMax;
    }
  }
  
  // 주차별 그룹화
  private groupByWeek(frame: any[]): Record<number, any[]> {
    return frame.reduce((acc, item) => {
      acc[item.week] = acc[item.week] || [];
      acc[item.week].push(item);
      return acc;
    }, {});
  }
  
  // 데이 타입별 스킴 선택
  private schemeByDayType(lift: string, dayType: string): any[] {
    return this.schemes.intensitySchemes[dayType]?.[lift] || this.schemes.intensitySchemes.moderate[lift];
  }
  
  // 스킴 컴파일
  private compileScheme(params: any, scheme: any[]): any[] {
    const compiled = scheme.map(s => ({
      exercise: this.translateVariation(params.variation),
      sets: s.sets.toString(),
      reps: s.reps.toString(),
      weightPercent: Math.round(s.percentage * params.weekIntensity).toString(),
      restMinutes: this.getRestTime(s.percentage * params.weekIntensity),
      rpe: s.rpe?.toString() || '7'
    }));
    
    console.log(`🏋️ ${params.lift.toUpperCase()} - Week ${params.week}, Day ${params.day} (${params.dayType}):`);
    compiled.forEach(ex => {
      console.log(`   ${ex.exercise}: ${ex.sets}sets x ${ex.reps}reps @ ${ex.weightPercent}% (RPE ${ex.rpe}, Rest ${ex.restMinutes}min)`);
    });
    
    return compiled;
  }
  
  // 변형운동 번역
  private translateVariation(variation: string): string {
    const translations: Record<string, string> = {
      'back_squat': 'Back Squat',
      'pause_squat': 'Pause Squat',
      'front_squat': 'Front Squat',
      'bench_press': 'Bench Press',
      'pause_bench': 'Pause Bench Press',
      'close_grip_bench': 'Close Grip Bench',
      'conventional_deadlift': 'Conventional Deadlift',
      'sumo_deadlift': 'Sumo Deadlift',
      'romanian_deadlift': 'Romanian Deadlift'
    };
    
    return translations[variation] || variation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // 휴식시간 계산
  private getRestTime(intensity: number): string {
    if (intensity >= 90) return '4-5';
    if (intensity >= 80) return '3-4';
    if (intensity >= 70) return '2-3';
    return '1-2';
  }
  
  // 액세서리 운동 생성
  private buildAccessories(canonical: CanonicalSurvey, dayFrame: any, rng: () => number): any[] {
    const accessories = [];
    
    // 간단한 액세서리 풀
    const accPool = [
      'Barbell Row', 'Pull-ups', 'Dips', 'Overhead Press',
      'Leg Press', 'Leg Curl', 'Calf Raise', 'Tricep Extension'
    ];
    
    // 2-3개 액세서리 추가
    for (let i = 0; i < 2; i++) {
      const idx = Math.floor(rng() * accPool.length);
      accessories.push({
        exercise: accPool[idx],
        sets: '3',
        reps: '8-12',
        weightPercent: '60-70',
        restMinutes: '1-2',
        rpe: '6'
      });
    }
    
    return accessories;
  }
  
  // 주차 포커스 결정
  private getWeekFocus(week: number, totalWeeks: number, intensity: number): string {
    if (intensity < 0.65) return '디로드 & 회복';
    if (intensity > 0.90) return '최대근력 & 피킹';
    if (week <= totalWeeks * 0.4) return '기초 체력 구축';
    if (week <= totalWeeks * 0.7) return '근력 향상';
    return '강화 & 적응';
  }
  
  // 프로그램 오버뷰 생성
  private generateOverview(canonical: CanonicalSurvey, volume: any, freq: any): string {
    return `${canonical.experience} 수준 맞춤형 파워리프팅 프로그램 (주간 ${freq.squat + freq.bench + freq.deadlift}회 훈련)`;
  }
  
  // 나머지 가이드라인 생성 메서드들은 기존과 동일
  private generateTitle(canonical: CanonicalSurvey): string {
    const level = canonical.experience === 'beginner' ? '초급' :
                 canonical.experience === 'intermediate' ? '중급' : '고급';
    return `${level} 파워리프팅 프로그램 (${canonical.frequency}일/주)`;
  }
  
  private generateProgressionNotes(): string {
    return 'RPE 기반 자동조절: 목표 RPE보다 쉽게 느껴지면 2.5-5kg 증량, 어렵게 느껴지면 유지 또는 감량';
  }
  
  private generateWarmupProtocol(): string {
    return '5분 유산소 + 동적 스트레칭 + 빈 바부터 시작하여 점진적 증량';
  }
  
  private generateCooldownProtocol(): string {
    return '5-10분 정적 스트레칭 + 폼롤링으로 근육 이완';
  }
  
  private generateSafetyGuidelines(): string {
    return '항상 스포터와 함께 훈련하고, RPE 9를 넘지 말며, 통증이 있으면 즉시 중단하세요.';
  }
  
  private generateNutritionGuidelines(): string {
    return '충분한 단백질(체중 1kg당 1.6-2.2g)과 탄수화물 섭취를 유지하세요.';
  }
  
  private generateRecoveryGuidelines(): string {
    return '7-9시간 수면과 충분한 휴식을 취하며, 스트레스를 관리하세요.';
  }
}

// 🏭 엔진 팩토리 (새로운 엔진으로 교체)
export function createSimpleEngine(): PowerliftingProgramEngine {
  return new PowerliftingProgramEngine();
}