// 전문가 파워리프팅 지식 데이터베이스
// 20+ 전문 코치들의 인사이트 통합

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

  // 변형운동 퍼센티지 가이드 (전문가 데이터 기반)
  VARIATION_PERCENTAGES: {
    squat: {
      pause_squat: { min: 85, max: 95, typical: 90 },
      tempo_squat: { min: 75, max: 85, typical: 80 },
      box_squat: { min: 80, max: 90, typical: 85 },
      front_squat: { min: 70, max: 85, typical: 75 },
      safety_bar: { min: 85, max: 95, typical: 90 },
      high_bar: { min: 90, max: 105, typical: 95 }
    },
    bench: {
      pause_bench: { min: 85, max: 95, typical: 90 },
      tempo_bench: { min: 75, max: 85, typical: 80 },
      close_grip: { min: 80, max: 90, typical: 85 },
      incline_bench: { min: 75, max: 85, typical: 80 },
      floor_press: { min: 85, max: 95, typical: 90 },
      pin_press: { min: 90, max: 110, typical: 100 }
    },
    deadlift: {
      pause_deadlift: { min: 85, max: 95, typical: 90 },
      deficit_deadlift: { min: 80, max: 90, typical: 85 },
      block_pull: { min: 105, max: 115, typical: 110 },
      rack_pull: { min: 110, max: 120, typical: 115 },
      romanian_deadlift: { min: 70, max: 85, typical: 75 },
      stiff_leg: { min: 65, max: 80, typical: 70 }
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
    selected.push({ name: '박스 스쿼트', percentage: variations.box_squat.typical });
    selected.push({ name: '포즈 스쿼트', percentage: variations.pause_squat.typical });
  }
  
  if (techniqueIssues?.includes('speed')) {
    selected.push({ name: '템포 스쿼트', percentage: variations.tempo_squat.typical });
  }
  
  // 기본 변형운동
  if (selected.length === 0) {
    selected.push({ name: '프론트 스쿼트', percentage: variations.front_squat.typical });
  }
  
  return selected;
}

function selectBenchVariations(techniqueIssues) {
  const variations = EXPERT_INSIGHTS.VARIATION_PERCENTAGES.bench;
  const selected = [];
  
  if (techniqueIssues?.includes('lockout')) {
    selected.push({ name: '핀프레스', percentage: variations.pin_press.typical });
    selected.push({ name: '클로즈그립 벤치', percentage: variations.close_grip.typical });
  }
  
  if (techniqueIssues?.includes('arch')) {
    selected.push({ name: '포즈 벤치', percentage: variations.pause_bench.typical });
    selected.push({ name: '플로어 프레스', percentage: variations.floor_press.typical });
  }
  
  // 기본 변형운동
  if (selected.length === 0) {
    selected.push({ name: '인클라인 벤치', percentage: variations.incline_bench.typical });
  }
  
  return selected;
}

function selectDeadliftVariations(techniqueIssues) {
  const variations = EXPERT_INSIGHTS.VARIATION_PERCENTAGES.deadlift;
  const selected = [];
  
  if (techniqueIssues?.includes('lockout')) {
    selected.push({ name: '블럭 풀', percentage: variations.block_pull.typical });
    selected.push({ name: '랙 풀', percentage: variations.rack_pull.typical });
  }
  
  if (techniqueIssues?.includes('speed')) {
    selected.push({ name: '데피싯 데드리프트', percentage: variations.deficit_deadlift.typical });
  }
  
  // 기본 변형운동
  if (selected.length === 0) {
    selected.push({ name: '루마니안 데드리프트', percentage: variations.romanian_deadlift.typical });
  }
  
  return selected;
}

function generateExpertRecommendations(surveyData) {
  const recommendations = [];
  
  // 약점 기반 권장사항
  if (surveyData.weakestLift === 'bench') {
    recommendations.push("벤치프레스 주간 빈도를 4-5회로 증가시켜 약점을 집중 보강하세요.");
  }
  
  // 볼륨 견딤력 기반
  if (surveyData.volumeTolerance === 'high') {
    recommendations.push("높은 볼륨 견딤력을 활용해 Ascending Back-off Sets을 적용하세요.");
  }
  
  // 경험 수준 기반
  if (surveyData.experience === 'advanced') {
    recommendations.push("고급자로서 Wave Loading 전략을 활용한 피리어다이제이션을 권장합니다.");
  }
  
  return recommendations;
}

export default EXPERT_INSIGHTS;