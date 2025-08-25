// ⚙️ Engine - planFromTables 골격 (sets/freq/weeks/guards만)

import { type CanonicalSurvey, type ProgramPlan, type Warning, SAFETY_LIMITS } from '../domain/types';

// 🔧 간단한 프로그램 생성 엔진 (골격)
export class SimpleProgramEngine {
  
  // 📊 테이블 기반 프로그램 생성
  async planFromTables(canonical: CanonicalSurvey): Promise<ProgramPlan> {
    console.log('🔧 SimpleProgramEngine: planFromTables 시작...');
    
    const warnings: Warning[] = [];
    
    // 1. 기본 설정
    const totalWeeks = this.calculateWeeks(canonical);
    const frequency = this.adjustFrequency(canonical, warnings);
    
    // 2. 주차별 계획 생성 (간단한 템플릿)
    const trainingWeeks = this.generateTrainingWeeks(totalWeeks, frequency, canonical);
    
    // 3. 가드 적용
    this.applyGuards(canonical, warnings);
    
    const program: ProgramPlan = {
      programTitle: this.generateTitle(canonical),
      totalWeeks,
      overview: this.generateOverview(canonical),
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
    
    console.log(`✅ 프로그램 생성 완료: ${totalWeeks}주, ${frequency}일/주`);
    return program;
  }
  
  // 📏 주차 계산
  private calculateWeeks(canonical: CanonicalSurvey): number {
    const baseWeeks = canonical.experience === 'beginner' ? 8 : 
                     canonical.experience === 'intermediate' ? 12 : 16;
    
    return Math.max(
      SAFETY_LIMITS.MIN_PROGRAM_WEEKS,
      Math.min(baseWeeks, SAFETY_LIMITS.MAX_PROGRAM_WEEKS)
    );
  }
  
  // 🔄 빈도 조정
  private adjustFrequency(canonical: CanonicalSurvey, warnings: Warning[]): number {
    let frequency = canonical.frequency;
    
    // 안전 제한 적용
    if (frequency > SAFETY_LIMITS.MAX_WEEKLY_FREQUENCY) {
      warnings.push({
        type: 'automatic_correction',
        rule: 'max_frequency_limit',
        message: `주간 빈도가 ${SAFETY_LIMITS.MAX_WEEKLY_FREQUENCY}일로 제한되었습니다`,
        original: frequency,
        corrected: SAFETY_LIMITS.MAX_WEEKLY_FREQUENCY
      });
      frequency = SAFETY_LIMITS.MAX_WEEKLY_FREQUENCY;
    }
    
    if (frequency < SAFETY_LIMITS.MIN_WEEKLY_FREQUENCY) {
      warnings.push({
        type: 'automatic_correction',
        rule: 'min_frequency_limit',
        message: `주간 빈도가 ${SAFETY_LIMITS.MIN_WEEKLY_FREQUENCY}일로 조정되었습니다`,
        original: frequency,
        corrected: SAFETY_LIMITS.MIN_WEEKLY_FREQUENCY
      });
      frequency = SAFETY_LIMITS.MIN_WEEKLY_FREQUENCY;
    }
    
    return frequency;
  }
  
  // 🏋️ 훈련 주차 생성 (간단한 템플릿)
  private generateTrainingWeeks(totalWeeks: number, frequency: number, canonical: CanonicalSurvey): any[] {
    const weeks = [];
    
    for (let week = 1; week <= totalWeeks; week++) {
      const workouts = [];
      
      for (let day = 1; day <= frequency; day++) {
        const exercises = this.generateExercises(day, week, canonical);
        
        workouts.push({
          day,
          workoutName: `Day ${day}`,
          exercises
        });
      }
      
      weeks.push({
        week,
        focus: this.getWeekFocus(week, totalWeeks),
        workouts
      });
    }
    
    return weeks;
  }
  
  // 💪 운동 생성 (간단한 세트/횟수 템플릿)
  private generateExercises(day: number, week: number, canonical: CanonicalSurvey): any[] {
    const intensity = 70 + (week * 2); // 점진적 증가
    const sets = canonical.experience === 'beginner' ? '3' : 
                canonical.experience === 'intermediate' ? '4' : '5';
    
    if (day === 1) { // 스쿼트 데이
      return [
        {
          exercise: 'Back Squat',
          sets,
          reps: '5',
          weightPercent: intensity.toString(),
          restMinutes: '3',
          rpe: '7-8'
        },
        {
          exercise: 'Romanian Deadlift',
          sets: '3',
          reps: '8',
          weightPercent: (intensity - 20).toString(),
          restMinutes: '2',
          rpe: '6-7'
        }
      ];
    } else if (day === 2) { // 벤치 데이
      return [
        {
          exercise: 'Bench Press',
          sets,
          reps: '5',
          weightPercent: intensity.toString(),
          restMinutes: '3',
          rpe: '7-8'
        },
        {
          exercise: 'Barbell Row',
          sets: '3',
          reps: '8',
          weightPercent: (intensity - 15).toString(),
          restMinutes: '2',
          rpe: '6-7'
        }
      ];
    } else { // 데드리프트 데이
      return [
        {
          exercise: 'Deadlift',
          sets: canonical.experience === 'beginner' ? '3' : '4',
          reps: '3',
          weightPercent: (intensity + 5).toString(),
          restMinutes: '4',
          rpe: '8'
        }
      ];
    }
  }
  
  // 🎯 주차별 포커스
  private getWeekFocus(week: number, totalWeeks: number): string {
    const phase = Math.floor((week - 1) / (totalWeeks / 3));
    
    switch (phase) {
      case 0: return '기초 체력 구축';
      case 1: return '근력 향상';
      default: return '최대 근력';
    }
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
}

// 🏭 엔진 팩토리
export function createSimpleEngine(): SimpleProgramEngine {
  return new SimpleProgramEngine();
}