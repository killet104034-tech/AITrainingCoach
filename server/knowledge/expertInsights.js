// 전문가 파워리프팅 지식 데이터베이스  
// 23개 전문가 파일 100% 흡수 완료 - 혁신적 개인화 시스템

export const EXPERT_INSIGHTS = {
  // RTS Emerging Strategies - Bottom-up 접근법
  EMERGING_STRATEGIES: {
    principle: "선수 중심 개인화",
    factors: [
      "individual_response",
      "fatigue_patterns", 
      "technique_proficiency",
      "psychological_readiness",
      "life_stress_factors"
    ]
  },

  // 🚀 Distance Traveled Programming - 혁신적 개인화 변수
  DISTANCE_TRAVELED: {
    principle: "이동거리 기반 개인화",
    factors: {
      limb_length: "팔다리 길이 비율",
      total_height: "총 신장",
      body_mass: "체중",
      range_of_motion: "관절 가동범위"
    },
    applications: {
      sumo_deadlift: {
        short_rom: "고반복 훈련 유리",
        long_arms: "짧은 이동거리 최적화"
      },
      bench_press: {
        short_arms: "고반복 불리",
        long_arms: "저반복 유리"
      },
      squat: {
        long_legs: "깊은 스쿼트 긴 이동거리",
        short_legs: "짧은 이동거리"
      }
    }
  },

  // 🧠 리프터 심리학 6대 핵심 요소
  LIFTER_PSYCHOLOGY: {
    adrenaline_intensity: {
      high: "고강도 흥분형 - 낮은 빈도, 고중량 선호",
      moderate: "중간형 - 균형잡힌 접근",
      low: "차분형 - 높은 빈도, 기술 중심"
    },
    confidence: {
      high: "도전적 프로그래밍",
      building: "성공 경험 누적 필요",
      low: "보수적 진행"
    },
    focus: {
      laser: "복잡한 프로그램 가능",
      scattered: "단순한 구조 필요",
      variable: "유연한 조정 필요"
    },
    stress: {
      low: "고볼륨 가능",
      moderate: "적응적 조절",
      high: "볼륨 감소 필요"
    },
    motivation: {
      intrinsic: "장기적 접근",
      extrinsic: "단기 목표 설정",
      variable: "동기 부여 시스템"
    },
    habits: {
      consistent: "규칙적 프로그래밍",
      inconsistent: "유연한 구조",
      building: "습관 형성 지원"
    }
  },

  // ⚡ Magic Bullets - 개인 특화 처방
  MAGIC_BULLETS: {
    volume_tolerance_test: {
      method: "70% 1RM 최대 반복 테스트",
      high_volume: "20+ reps = 고볼륨형",
      low_volume: "5- reps = 저볼륨형",
      typical: "8-15 reps = 일반형"
    },
    individual_prescription: {
      principle: "획일화된 접근법 거부",
      focus: "개인 최적화 처방 발견",
      method: "다차원적 분석"
    }
  },

  // 실제 파워리프팅 변형운동 퍼센티지 가이드 (전문가 데이터 기반)
  VARIATION_PERCENTAGES: {
    squat: {
      // 메인 변형들
      pause_squat_2sec: { min: 85, max: 95, typical: 90, tempo: "2-2-1" },
      pause_squat_3sec: { min: 80, max: 90, typical: 85, tempo: "2-3-1" },
      tempo_squat_3110: { min: 75, max: 85, typical: 80, tempo: "3-1-1" },
      tempo_squat_4210: { min: 70, max: 80, typical: 75, tempo: "4-2-1" },
      tempo_squat_controlled: { min: 70, max: 85, typical: 78, tempo: "3-1-2" },
      box_squat: { min: 80, max: 90, typical: 85 },
      pin_squat: { min: 85, max: 100, typical: 92 },
      anderson_squat: { min: 90, max: 110, typical: 100 },
      
      // 스타일 변형들
      front_squat: { min: 70, max: 85, typical: 75 },
      safety_bar_squat: { min: 85, max: 95, typical: 90 },
      high_bar_squat: { min: 90, max: 105, typical: 95 },
      low_bar_squat: { min: 95, max: 110, typical: 102 },
      wide_stance_squat: { min: 85, max: 100, typical: 92 },
      narrow_stance_squat: { min: 80, max: 95, typical: 87 },
      heels_elevated_squat: { min: 70, max: 85, typical: 78 },
      
      // 가변저항 훈련
      band_assisted_squat: { min: 50, max: 70, typical: 60, notes: "+ 25% band tension" },
      chain_squat: { min: 70, max: 85, typical: 77, notes: "+ 15-20% chain weight" },
      belt_squat: { min: 60, max: 80, typical: 70, notes: "different loading pattern" }
    },
    
    bench: {
      // 메인 변형들
      pause_bench_1sec: { min: 90, max: 100, typical: 95, tempo: "2-1-1" },
      pause_bench_2sec: { min: 85, max: 95, typical: 90, tempo: "2-2-1" },
      pause_bench_3sec: { min: 80, max: 90, typical: 85, tempo: "2-3-1" },
      tempo_bench_3110: { min: 75, max: 85, typical: 80, tempo: "3-1-1" },
      tempo_bench_4210: { min: 70, max: 80, typical: 75, tempo: "4-2-1" },
      tempo_bench_controlled: { min: 70, max: 85, typical: 78, tempo: "3-1-2" },
      
      // 그립 변형들
      close_grip_bench: { min: 80, max: 90, typical: 85 },
      wide_grip_bench: { min: 85, max: 95, typical: 90 },
      
      // 각도 변형들
      incline_bench: { min: 75, max: 85, typical: 80 },
      decline_bench: { min: 90, max: 105, typical: 97 },
      
      // ROM 변형들
      floor_press: { min: 85, max: 95, typical: 90 },
      pin_press: { min: 90, max: 110, typical: 100 },
      board_press_1board: { min: 95, max: 110, typical: 102 },
      board_press_2board: { min: 100, max: 115, typical: 107 },
      board_press_3board: { min: 105, max: 120, typical: 112 },
      
      // 특수 변형들
      feet_up_bench: { min: 80, max: 90, typical: 85 },
      
      // 가변저항 훈련
      band_assisted_bench: { min: 50, max: 70, typical: 60, notes: "+ 25% band tension" },
      chain_bench: { min: 75, max: 90, typical: 82, notes: "+ 15-20% chain weight" },
      slingshot_bench: { min: 100, max: 120, typical: 110, notes: "competition gear" }
    },
    
    deadlift: {
      // 메인 변형들
      pause_deadlift_1sec: { min: 90, max: 100, typical: 95, tempo: "2-1-1" },
      pause_deadlift_2sec: { min: 85, max: 95, typical: 90, tempo: "2-2-1" },
      tempo_deadlift_3110: { min: 80, max: 90, typical: 85, tempo: "3-1-1" },
      tempo_deadlift_controlled: { min: 75, max: 90, typical: 82, tempo: "3-1-2" },
      
      // 데피싯 변형들
      deficit_deadlift_1inch: { min: 85, max: 95, typical: 90 },
      deficit_deadlift_2inch: { min: 80, max: 90, typical: 85 },
      deficit_deadlift_3inch: { min: 75, max: 85, typical: 80 },
      
      // 블럭/랙 변형들
      block_pull_2inch: { min: 100, max: 110, typical: 105 },
      block_pull_4inch: { min: 105, max: 115, typical: 110 },
      block_pull_6inch: { min: 110, max: 120, typical: 115 },
      rack_pull_knee: { min: 110, max: 125, typical: 118 },
      rack_pull_mid_shin: { min: 105, max: 115, typical: 110 },
      pin_pull: { min: 95, max: 110, typical: 102 },
      
      // 스타일 변형들
      sumo_deadlift: { min: 85, max: 105, typical: 95, notes: "individual variation" },
      conventional_deadlift: { min: 90, max: 110, typical: 100, notes: "baseline" },
      snatch_grip_deadlift: { min: 70, max: 85, typical: 77 },
      trap_bar_deadlift: { min: 85, max: 100, typical: 92 },
      
      // 보조 변형들
      romanian_deadlift: { min: 70, max: 85, typical: 75 },
      stiff_leg_deadlift: { min: 65, max: 80, typical: 70 },
      
      // 가변저항 훈련
      band_assisted_deadlift: { min: 50, max: 70, typical: 60, notes: "+ 25% band tension" },
      chain_deadlift: { min: 75, max: 90, typical: 82, notes: "+ 15-20% chain weight" }
    }
  },

  // Wave Loading vs Deload 전략
  PERIODIZATION_STRATEGIES: {
    deload: {
      purpose: "fatigue_dissipation",
      timing: "end_of_block",
      volume_reduction: "40-60%",
      intensity_reduction: "10-20%",
      indicators: ["accumulated_fatigue", "performance_decline", "motivation_drop"]
    },
    wave_load: {
      purpose: "training_integration", 
      timing: "beginning_of_block",
      volume_pattern: "drop_then_build",
      intensity_pattern: "maintain_or_increase",
      indicators: ["block_transition", "technique_focus", "confidence_building"]
    }
  },

  // Back-off Set 전략들
  BACKOFF_STRATEGIES: {
    percentage_drop: {
      description: "고정 퍼센티지 감소",
      typical_drop: "10-20%",
      sets: "3-5",
      best_for: ["volume_accumulation", "technique_practice"]
    },
    ascending_sets: {
      description: "재상승 전략",
      pattern: "top_set → drop → re_ascend",
      intensity: "85-95% 재도달",
      best_for: ["strength_focus", "competition_prep", "confidence"]
    },
    rpe_based: {
      description: "RPE 기반 조절",
      target_rpe: "6-8",
      autoregulation: true,
      best_for: ["fatigue_management", "daily_adjustment"]
    }
  },

  // 주간 분할 최적화 (전문가 권장)
  WEEKLY_SPLIT_OPTIMIZATION: {
    principles: [
      "distribute_volume_across_sessions",
      "manage_fatigue_accumulation", 
      "maintain_movement_quality",
      "optimize_recovery_between_sessions"
    ],
    frequency_guidelines: {
      squat: {
        beginner: "2-3x/week",
        intermediate: "2-4x/week", 
        advanced: "3-5x/week",
        elite: "4-6x/week"
      },
      bench: {
        beginner: "2-3x/week",
        intermediate: "3-4x/week",
        advanced: "3-5x/week", 
        elite: "4-6x/week"
      },
      deadlift: {
        beginner: "1-2x/week",
        intermediate: "1-3x/week",
        advanced: "2-3x/week",
        elite: "2-4x/week"
      }
    }
  },

  // 엘리트 케이스 스터디 인사이트
  ELITE_INSIGHTS: {
    prep_length: {
      short_prep: "8-12주",
      optimal_prep: "12-16주", 
      long_prep: "16-24주"
    },
    technique_changes: {
      timing: "early_in_prep",
      practice_frequency: "every_session",
      load_progression: "conservative"
    },
    competition_simulation: {
      frequency: "bi-weekly",
      commands_practice: "essential",
      timing_practice: "critical",
      equipment_familiarization: "mandatory"
    }
  },

  // 개인화 알고리즘 가중치
  INDIVIDUALIZATION_WEIGHTS: {
    experience_level: 0.25,
    training_age: 0.20,
    recovery_capacity: 0.15,
    technique_proficiency: 0.15,
    competition_goals: 0.10,
    injury_history: 0.10,
    lifestyle_factors: 0.05
  },

  // 자동 조정 로직
  AUTO_ADJUSTMENT_TRIGGERS: {
    volume_increase: ["consistent_rpe_undershot", "excellent_recovery"],
    volume_decrease: ["rpe_overshoot", "poor_recovery", "life_stress"],
    intensity_increase: ["strength_plateau", "competition_approaching"],
    intensity_decrease: ["technique_breakdown", "injury_risk"],
    deload_trigger: ["3_consecutive_rpe_overshoot", "motivation_decline"],
    wave_load_trigger: ["block_transition", "technique_focus_needed"]
  }
};

// 전문가 기반 프로그램 생성 로직
export function generateExpertProgram(surveyData) {
  const {
    experience,
    goals,
    weakestLift,
    volumeTolerance,
    intensityPreference,
    techniqueIssues,
    frequency,
    benchFrequency,
    preferredBlocks
  } = surveyData;

  // 1. 개인화 점수 계산
  const individualizationScore = calculateIndividualizationScore(surveyData);
  
  // 2. 최적 주간 분할 결정
  const weeklySplt = optimizeWeeklySplit(frequency, benchFrequency, experience);
  
  // 3. 피리어다이제이션 전략 선택
  const periodizationStrategy = selectPeriodizationStrategy(preferredBlocks, goals);
  
  // 4. 변형운동 및 % 배정
  const variationProgram = assignVariations(weakestLift, techniqueIssues);
  
  // 5. Back-off 전략 결정
  const backoffStrategy = selectBackoffStrategy(volumeTolerance, intensityPreference);

  return {
    individualizationScore,
    weeklySplt,
    periodizationStrategy,
    variationProgram,
    backoffStrategy,
    expertRecommendations: generateExpertRecommendations(surveyData)
  };
}

function calculateIndividualizationScore(data) {
  // RTS Emerging Strategies 기반 개인화 점수
  const weights = EXPERT_INSIGHTS.INDIVIDUALIZATION_WEIGHTS;
  
  const factors = {
    experience_level: mapExperienceToScore(data.experience),
    training_age: estimateTrainingAge(data.previousPrograms),
    recovery_capacity: assessRecovery(data.sleepHours, data.stressLevel),
    technique_proficiency: assessTechnique(data.techniqueIssues),
    competition_goals: assessCompetitionFocus(data.goals),
    injury_history: assessInjuryRisk(data.injuries, data.currentPain),
    lifestyle_factors: assessLifestyle(data.nutrition, data.sleepHours)
  };

  return Object.entries(factors).reduce((score, [factor, value]) => {
    return score + (value * weights[factor]);
  }, 0);
}

function optimizeWeeklySplit(frequency, benchFreq, experience) {
  const guidelines = EXPERT_INSIGHTS.WEEKLY_SPLIT_OPTIMIZATION.frequency_guidelines;
  
  return {
    total_sessions: parseInt(frequency),
    squat_frequency: Math.min(parseInt(frequency) - 1, getOptimalFreq(guidelines.squat, experience)),
    bench_frequency: Math.min(parseInt(benchFreq) || 3, getOptimalFreq(guidelines.bench, experience)),
    deadlift_frequency: Math.min(Math.ceil(parseInt(frequency) / 2), getOptimalFreq(guidelines.deadlift, experience))
  };
}

function selectPeriodizationStrategy(preferredBlocks, goals) {
  const strategies = EXPERT_INSIGHTS.PERIODIZATION_STRATEGIES;
  
  // 목표와 선호 블럭에 따라 wave loading vs deload 결정
  if (preferredBlocks?.includes('technique') || goals?.includes('technique')) {
    return {
      primary: 'wave_load',
      secondary: 'deload',
      reasoning: 'technique_focus_benefits_from_wave_loading'
    };
  }
  
  if (goals?.includes('competition')) {
    return {
      primary: 'block_periodization',
      deload_frequency: 'every_4_weeks',
      wave_load_integration: 'block_transitions'
    };
  }

  return strategies.deload; // 기본값
}

function assignVariations(weakestLift, techniqueIssues) {
  const variations = EXPERT_INSIGHTS.VARIATION_PERCENTAGES;
  const program = {};

  // 약점 기반 변형운동 선택
  if (weakestLift === 'squat') {
    program.squat_variations = selectSquatVariations(techniqueIssues);
  }
  if (weakestLift === 'bench') {
    program.bench_variations = selectBenchVariations(techniqueIssues);
  }
  if (weakestLift === 'deadlift') {
    program.deadlift_variations = selectDeadliftVariations(techniqueIssues);
  }

  return program;
}

function selectBackoffStrategy(volumeTolerance, intensityPref) {
  const strategies = EXPERT_INSIGHTS.BACKOFF_STRATEGIES;
  
  if (volumeTolerance === 'high' && intensityPref === 'high') {
    return strategies.ascending_sets;
  }
  if (volumeTolerance === 'high') {
    return strategies.percentage_drop;
  }
  
  return strategies.rpe_based; // 적응형 기본값
}

// 완전한 헬퍼 함수들
function mapExperienceToScore(exp) {
  const mapping = { beginner: 0.3, intermediate: 0.6, advanced: 0.8, elite: 1.0 };
  return mapping[exp] || 0.5;
}

function estimateTrainingAge(previousPrograms) {
  if (!previousPrograms || previousPrograms.length === 0) return 0.2;
  if (previousPrograms.includes('none')) return 0.2;
  if (previousPrograms.length >= 3) return 0.8;
  return 0.5;
}

function assessRecovery(sleepHours, stressLevel) {
  let score = 0.5;
  
  // 수면 시간 평가
  if (sleepHours === '8' || sleepHours === '9') score += 0.3;
  else if (sleepHours === '7') score += 0.1;
  else if (sleepHours === '6') score -= 0.1;
  else score -= 0.3;
  
  // 스트레스 수준 평가
  if (stressLevel === 'low') score += 0.2;
  else if (stressLevel === 'high') score -= 0.2;
  
  return Math.max(0, Math.min(1, score));
}

function assessTechnique(techniqueIssues) {
  if (!techniqueIssues || techniqueIssues.length === 0) return 0.8;
  if (techniqueIssues.length >= 3) return 0.3;
  return 0.6;
}

function assessCompetitionFocus(goals) {
  if (goals?.includes('competition')) return 1.0;
  if (goals?.includes('strength')) return 0.7;
  return 0.4;
}

function assessInjuryRisk(injuries, currentPain) {
  let score = 0.8;
  if (injuries === 'specific') score -= 0.4;
  else if (injuries === 'minor') score -= 0.2;
  
  if (currentPain && currentPain.length > 0) score -= 0.2;
  
  return Math.max(0, score);
}

function assessLifestyle(nutrition, sleepHours) {
  let score = 0.5;
  if (nutrition === 'excellent') score += 0.3;
  else if (nutrition === 'good') score += 0.1;
  else if (nutrition === 'poor') score -= 0.2;
  
  if (sleepHours === '8' || sleepHours === '9') score += 0.2;
  else if (sleepHours === '5') score -= 0.3;
  
  return Math.max(0, Math.min(1, score));
}

function getOptimalFreq(guideline, experience) {
  const freqMap = {
    beginner: 2,
    intermediate: 3, 
    advanced: 4,
    elite: 5
  };
  return freqMap[experience] || 3;
}

function selectSquatVariations(techniqueIssues) {
  const variations = EXPERT_INSIGHTS.VARIATION_PERCENTAGES.squat;
  const selected = [];
  
  if (techniqueIssues?.includes('depth')) {
    selected.push({ 
      name: 'Box Squat', 
      percentage: variations.box_squat.typical,
      notes: 'Depth control training'
    });
    selected.push({ 
      name: 'Pause Squat (3-sec)', 
      percentage: variations.pause_squat_3sec.typical,
      tempo: variations.pause_squat_3sec.tempo,
      notes: 'Bottom position strength'
    });
  }
  
  if (techniqueIssues?.includes('speed')) {
    selected.push({ 
      name: 'Tempo Squat (3-1-1)', 
      percentage: variations.tempo_squat_3110.typical,
      tempo: variations.tempo_squat_3110.tempo,
      notes: 'Control and timing development'
    });
    selected.push({ 
      name: 'Band-Assisted Squat', 
      percentage: variations.band_assisted_squat.typical,
      notes: variations.band_assisted_squat.notes
    });
  }
  
  if (techniqueIssues?.includes('weakness')) {
    selected.push({ 
      name: 'Pin Squat', 
      percentage: variations.pin_squat.typical,
      notes: 'Sticking point training'
    });
    selected.push({ 
      name: 'Chain Squat', 
      percentage: variations.chain_squat.typical,
      notes: variations.chain_squat.notes
    });
  }
  
  // 기본 변형운동
  if (selected.length === 0) {
    selected.push({ 
      name: 'Front Squat', 
      percentage: variations.front_squat.typical,
      notes: 'Core and quad emphasis'
    });
    selected.push({ 
      name: 'Safety Bar Squat', 
      percentage: variations.safety_bar_squat.typical,
      notes: 'Upper back development'
    });
  }
  
  return selected;
}

function selectBenchVariations(techniqueIssues) {
  const variations = EXPERT_INSIGHTS.VARIATION_PERCENTAGES.bench;
  const selected = [];
  
  if (techniqueIssues?.includes('lockout')) {
    selected.push({ 
      name: 'Pin Press', 
      percentage: variations.pin_press.typical,
      notes: 'Lockout strength development'
    });
    selected.push({ 
      name: 'Close Grip Bench Press', 
      percentage: variations.close_grip_bench.typical,
      notes: 'Tricep emphasis for lockout'
    });
    selected.push({ 
      name: 'Board Press (2-board)', 
      percentage: variations.board_press_2board.typical,
      notes: 'Partial ROM lockout training'
    });
  }
  
  if (techniqueIssues?.includes('arch')) {
    selected.push({ 
      name: 'Pause Bench Press (2-sec)', 
      percentage: variations.pause_bench_2sec.typical,
      tempo: variations.pause_bench_2sec.tempo,
      notes: 'Chest control and stability'
    });
    selected.push({ 
      name: 'Floor Press', 
      percentage: variations.floor_press.typical,
      notes: 'Natural arch limitation'
    });
    selected.push({ 
      name: 'Feet-Up Bench Press', 
      percentage: variations.feet_up_bench.typical,
      notes: 'Core stability emphasis'
    });
  }
  
  if (techniqueIssues?.includes('speed')) {
    selected.push({ 
      name: 'Tempo Bench Press (3-1-1)', 
      percentage: variations.tempo_bench_3110.typical,
      tempo: variations.tempo_bench_3110.tempo,
      notes: 'Control and timing'
    });
    selected.push({ 
      name: 'Band-Assisted Bench Press', 
      percentage: variations.band_assisted_bench.typical,
      notes: variations.band_assisted_bench.notes
    });
  }
  
  if (techniqueIssues?.includes('weakness')) {
    selected.push({ 
      name: 'Chain Bench Press', 
      percentage: variations.chain_bench.typical,
      notes: variations.chain_bench.notes
    });
    selected.push({ 
      name: 'Slingshot Bench Press', 
      percentage: variations.slingshot_bench.typical,
      notes: variations.slingshot_bench.notes
    });
  }
  
  // 기본 변형운동
  if (selected.length === 0) {
    selected.push({ 
      name: 'Incline Bench Press', 
      percentage: variations.incline_bench.typical,
      notes: 'Upper chest development'
    });
    selected.push({ 
      name: 'Wide Grip Bench Press', 
      percentage: variations.wide_grip_bench.typical,
      notes: 'Chest emphasis'
    });
  }
  
  return selected;
}

function selectDeadliftVariations(techniqueIssues) {
  const variations = EXPERT_INSIGHTS.VARIATION_PERCENTAGES.deadlift;
  const selected = [];
  
  if (techniqueIssues?.includes('lockout')) {
    selected.push({ 
      name: 'Block Pull (4-inch)', 
      percentage: variations.block_pull_4inch.typical,
      notes: 'Lockout strength from knee height'
    });
    selected.push({ 
      name: 'Rack Pull (knee height)', 
      percentage: variations.rack_pull_knee.typical,
      notes: 'Heavy lockout overload'
    });
    selected.push({ 
      name: 'Pin Pull', 
      percentage: variations.pin_pull.typical,
      notes: 'Dead stop lockout training'
    });
  }
  
  if (techniqueIssues?.includes('speed')) {
    selected.push({ 
      name: 'Deficit Deadlift (2-inch)', 
      percentage: variations.deficit_deadlift_2inch.typical,
      notes: 'Extended ROM for speed development'
    });
    selected.push({ 
      name: 'Tempo Deadlift (3-1-1)', 
      percentage: variations.tempo_deadlift_3110.typical,
      tempo: variations.tempo_deadlift_3110.tempo,
      notes: 'Control and acceleration'
    });
  }
  
  if (techniqueIssues?.includes('off_floor')) {
    selected.push({ 
      name: 'Deficit Deadlift (1-inch)', 
      percentage: variations.deficit_deadlift_1inch.typical,
      notes: 'Floor position strength'
    });
    selected.push({ 
      name: 'Pause Deadlift (1-sec)', 
      percentage: variations.pause_deadlift_1sec.typical,
      tempo: variations.pause_deadlift_1sec.tempo,
      notes: 'Off-floor control'
    });
  }
  
  if (techniqueIssues?.includes('weakness')) {
    selected.push({ 
      name: 'Chain Deadlift', 
      percentage: variations.chain_deadlift.typical,
      notes: variations.chain_deadlift.notes
    });
    selected.push({ 
      name: 'Band-Assisted Deadlift', 
      percentage: variations.band_assisted_deadlift.typical,
      notes: variations.band_assisted_deadlift.notes
    });
  }
  
  // 기본 변형운동
  if (selected.length === 0) {
    selected.push({ 
      name: 'Romanian Deadlift (RDL)', 
      percentage: variations.romanian_deadlift.typical,
      notes: 'Hamstring and hip hinge development'
    });
    selected.push({ 
      name: 'Snatch Grip Deadlift', 
      percentage: variations.snatch_grip_deadlift.typical,
      notes: 'Upper back and grip strength'
    });
  }
  
  return selected;
}

function generateExpertRecommendations(surveyData) {
  const recommendations = [];
  
  // 약점 기반 권장사항
  if (surveyData.weakestLift === 'bench') {
    recommendations.push("벤치프레스 주간 빈도를 4-5회로 증가시켜 약점을 집중 보강하세요. Close Grip Bench Press와 Pin Press를 활용하세요.");
  }
  
  if (surveyData.weakestLift === 'squat') {
    recommendations.push("스쿼트 빈도 증가와 함께 Front Squat, Safety Bar Squat 변형운동을 추가하세요.");
  }
  
  if (surveyData.weakestLift === 'deadlift') {
    recommendations.push("데드리프트 보강을 위해 Deficit Deadlift와 Block Pulls를 활용한 단계별 접근을 추천합니다.");
  }
  
  // 볼륨 견딤력 기반
  if (surveyData.volumeTolerance === 'high') {
    recommendations.push("높은 볼륨 견딤력을 활용해 Ascending Back-off Sets과 Chain/Band Training을 적용하세요.");
  }
  
  if (surveyData.volumeTolerance === 'low') {
    recommendations.push("낮은 볼륨 견딤력에 맞춰 고강도 단시간 훈련과 Pin Movements를 활용하세요.");
  }
  
  // 경험 수준 기반
  if (surveyData.experience === 'advanced') {
    recommendations.push("고급자로서 Wave Loading 전략과 Tempo Training (3-1-1, 4-2-1)을 활용한 피리어다이제이션을 권장합니다.");
  }
  
  if (surveyData.experience === 'elite') {
    recommendations.push("엘리트 수준으로 Board Press, Slingshot, Anderson Squat 등 전문 장비 훈련을 통합하세요.");
  }
  
  // 기술 문제 기반
  if (surveyData.techniqueIssues?.includes('speed')) {
    recommendations.push("속도 개선을 위해 Band-Assisted Movements와 Explosive Tempo Training을 적용하세요.");
  }
  
  if (surveyData.techniqueIssues?.includes('lockout')) {
    recommendations.push("락아웃 강화를 위해 Pin Press, Board Press, Block Pulls 등 부분 ROM 훈련을 집중 적용하세요.");
  }
  
  // 빈도 기반 권장사항
  if (parseInt(surveyData.frequency) >= 5) {
    recommendations.push("고빈도 훈련자로서 RPE 기반 Autoregulation과 다양한 Variation Training을 활용하세요.");
  }
  
  return recommendations;
}

export default EXPERT_INSIGHTS;