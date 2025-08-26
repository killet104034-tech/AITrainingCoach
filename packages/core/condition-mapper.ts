// 🎯 계층적 조건 매핑 시스템
// 📊 상위→하위→최하위 분류를 통한 체계적 선별

export interface ConditionNode {
  id: string;
  name: string;
  level: 'primary' | 'secondary' | 'tertiary';
  children?: ConditionNode[];
  value?: any;
}

export interface MappingRule {
  conditions: ConditionPath[];
  result: TrainingProtocol;
  priority: number;
}

export interface ConditionPath {
  primary: string;     // 상위: 경험수준, 목표 등
  secondary: string;   // 하위: 훈련빈도, 장비접근성 등  
  tertiary: string;    // 최하위: 백오프방식, RPE선호도 등
}

export interface TrainingProtocol {
  program_structure: {
    block_length: number;
    progression_scheme: string;
    deload_frequency: number;
  };
  scheduling: {
    days_per_week: number;
    session_distribution: string[];
    rest_day_pattern: string;
  };
  exercise_selection: {
    core_lifts: string[];
    accessory_exercises: string[];
    exercise_rotation: string;
  };
  intensity_protocols: {
    backoff_method: string;
    set_structure: string;
    rpe_targets: number[];
    percentage_ranges: string[];
  };
}

export class ConditionMapper {
  private rules: MappingRule[] = [];
  
  constructor() {
    this.initializeRules();
  }

  // 🏗️ 체계적 규칙 초기화
  private initializeRules() {
    // 예시: 초급자 + 근력목표 + 스트레이트세트
    this.addRule({
      conditions: [{
        primary: 'beginner',
        secondary: 'strength_focus', 
        tertiary: 'straight_sets'
      }],
      result: {
        program_structure: {
          block_length: 4,
          progression_scheme: 'linear',
          deload_frequency: 4
        },
        scheduling: {
          days_per_week: 3,
          session_distribution: ['squat_focus', 'bench_focus', 'deadlift_focus'],
          rest_day_pattern: 'every_other_day'
        },
        exercise_selection: {
          core_lifts: ['squat', 'bench', 'deadlift'],
          accessory_exercises: ['rows', 'overhead_press', 'lunges'],
          exercise_rotation: 'weekly'
        },
        intensity_protocols: {
          backoff_method: 'straight_sets',
          set_structure: 'same_weight_reps',
          rpe_targets: [7, 8, 8],
          percentage_ranges: ['70-75%', '75-80%', '80-85%']
        }
      },
      priority: 100
    });

    // 예시: 중급자 + 근력목표 + 다운세트  
    this.addRule({
      conditions: [{
        primary: 'intermediate',
        secondary: 'strength_focus',
        tertiary: 'down_sets'
      }],
      result: {
        program_structure: {
          block_length: 6,
          progression_scheme: 'block_periodization', 
          deload_frequency: 6
        },
        scheduling: {
          days_per_week: 4,
          session_distribution: ['squat_bench', 'deadlift_press', 'squat_accessories', 'bench_accessories'],
          rest_day_pattern: 'two_on_one_off'
        },
        exercise_selection: {
          core_lifts: ['squat', 'bench', 'deadlift', 'overhead_press'],
          accessory_exercises: ['front_squat', 'incline_bench', 'romanian_deadlift', 'rows'],
          exercise_rotation: 'biweekly'
        },
        intensity_protocols: {
          backoff_method: 'down_sets',
          set_structure: 'descending_weight',
          rpe_targets: [8, 7, 6],
          percentage_ranges: ['85-90%', '75-80%', '65-70%']
        }
      },
      priority: 90
    });
  }

  // 📋 조건 기반 프로토콜 매핑
  public mapConditionsToProtocol(surveyData: any): TrainingProtocol {
    // 1. 설문 데이터를 조건 경로로 변환
    const conditionPath = this.extractConditionPath(surveyData);
    
    // 2. 매칭 규칙 찾기 (우선순위 기반)
    const matchingRule = this.findBestMatch(conditionPath);
    
    if (!matchingRule) {
      return this.getDefaultProtocol();
    }
    
    // 3. 개별 조건에 맞게 프로토콜 세부 조정
    return this.customizeProtocol(matchingRule.result, surveyData);
  }

  // 🔍 설문 데이터 → 조건 경로 변환
  private extractConditionPath(surveyData: any): ConditionPath {
    return {
      primary: this.determinePrimaryCondition(surveyData),
      secondary: this.determineSecondaryCondition(surveyData), 
      tertiary: this.determineTertiaryCondition(surveyData)
    };
  }

  // 🎯 상위 조건 결정 (경험 수준, 주요 목표)
  private determinePrimaryCondition(data: any): string {
    if (data.experience_level) return data.experience_level;
    if (data.years_training && data.years_training < 1) return 'beginner';
    if (data.years_training && data.years_training < 3) return 'intermediate';
    return 'advanced';
  }

  // 🎯 하위 조건 결정 (훈련 빈도, 목표 세분화)
  private determineSecondaryCondition(data: any): string {
    if (data.goals?.includes('strength')) return 'strength_focus';
    if (data.goals?.includes('muscle')) return 'hypertrophy_focus'; 
    if (data.goals?.includes('competition')) return 'competition_prep';
    return 'general_fitness';
  }

  // 🎯 최하위 조건 결정 (세부 선호도)
  private determineTertiaryCondition(data: any): string {
    if (data.backoff_method) return data.backoff_method;
    if (data.set_preference) return data.set_preference;
    return 'straight_sets'; // 기본값
  }

  // 🏆 최적 매칭 규칙 찾기
  private findBestMatch(conditionPath: ConditionPath): MappingRule | null {
    return this.rules
      .filter(rule => this.isMatch(rule.conditions[0], conditionPath))
      .sort((a, b) => b.priority - a.priority)[0] || null;
  }

  // ✅ 조건 매칭 확인
  private isMatch(ruleCondition: ConditionPath, userCondition: ConditionPath): boolean {
    return ruleCondition.primary === userCondition.primary &&
           ruleCondition.secondary === userCondition.secondary &&
           ruleCondition.tertiary === userCondition.tertiary;
  }

  // 🛠️ 프로토콜 개별 맞춤화
  private customizeProtocol(baseProtocol: TrainingProtocol, surveyData: any): TrainingProtocol {
    const customized = JSON.parse(JSON.stringify(baseProtocol));
    
    // 훈련 가능 요일에 따른 스케줄 조정
    if (surveyData.available_days) {
      customized.scheduling.days_per_week = Math.min(
        customized.scheduling.days_per_week, 
        surveyData.available_days.length
      );
    }
    
    // 장비 제약에 따른 운동 선택 조정
    if (surveyData.equipment_limitations) {
      customized.exercise_selection = this.adjustForEquipment(
        customized.exercise_selection, 
        surveyData.equipment_limitations
      );
    }
    
    return customized;
  }

  // 🏃‍♂️ 장비 제약 대응
  private adjustForEquipment(exercises: any, limitations: string[]): any {
    const adjusted = { ...exercises };
    
    if (limitations.includes('no_barbell')) {
      adjusted.core_lifts = adjusted.core_lifts.map((lift: string) => {
        switch(lift) {
          case 'squat': return 'goblet_squat';
          case 'bench': return 'dumbbell_press';
          case 'deadlift': return 'dumbbell_deadlift';
          default: return lift;
        }
      });
    }
    
    return adjusted;
  }

  // 🔧 규칙 추가
  private addRule(rule: MappingRule): void {
    this.rules.push(rule);
  }

  // 📋 기본 프로토콜
  private getDefaultProtocol(): TrainingProtocol {
    return {
      program_structure: {
        block_length: 4,
        progression_scheme: 'linear',
        deload_frequency: 4
      },
      scheduling: {
        days_per_week: 3,
        session_distribution: ['full_body', 'full_body', 'full_body'],
        rest_day_pattern: 'every_other_day'
      },
      exercise_selection: {
        core_lifts: ['squat', 'bench', 'deadlift'],
        accessory_exercises: ['rows', 'overhead_press'],
        exercise_rotation: 'weekly'
      },
      intensity_protocols: {
        backoff_method: 'straight_sets',
        set_structure: 'same_weight_reps', 
        rpe_targets: [7, 8],
        percentage_ranges: ['70-75%', '75-80%']
      }
    };
  }
}