/**
 * Universal Pipeline Engine - Contracts
 * Structure-only definitions, NO domain values, NO numeric limits
 * All logic provided externally via PolicyProvider
 */

export interface SurveyData {
  // Profile Section
  profile: {
    user_name: string;
    sex_label: string;
    age_value: string;
    bodyweight_value: string;
    experience_label: string;
    goal_label: string;
  };

  // Constraints Section
  constraints: {
    frequency_cap: string;
    day_availability: string[];
    timeslot_availability: string[];
    exclusion_labels: string[];
  };

  // Core Lifts Section
  core_lifts: {
    topset_protocol: string;
    backoff_protocol: string;
    leverage_label: string;
    adaptation_label: string;
  };

  // Roles Section
  roles: {
    main: string;
    accessory: string;
    variation: string;
  };

  // Body Preferences Section
  body_preferences: {
    labels: string[];
  };

  // Body Regions Section
  body_regions: {
    upper: string;
    lower: string;
    full: string;
  };

  // Sub Regions Section
  sub_regions: {
    sub_a: string;
    sub_b: string;
    sub_c: string;
  };

  // Volume Buckets Section
  volume_buckets: {
    low: string;
    medium: string;
    high: string;
  };

  // Session Structure Section
  session_structure: {
    split_label: string;
    role_layout_label: string;
    ma_ratio_policy: string;
    ma_allocation_rule: string;
  };

  // Variation & Accessory Section
  variation_accessory: {
    failure_pattern_label: string;
    accessory_pool_label: string;
  };

  // Output Section
  output: {
    plan: string;
    summary: string;
    audit: string;
  };
}

export interface StageContext {
  stage_id: string;
  input_data: any;
  stage_output: any;
  audit_log: AuditEntry[];
  metadata: Record<string, any>;
}

export interface AuditEntry {
  stage_id: string;
  timestamp: string;
  action: string;
  input_keys: string[];
  output_keys: string[];
  metadata: Record<string, any>;
}

export interface PipelineResult {
  success: boolean;
  final_output: any;
  audit_trail: AuditEntry[];
  error_stage?: string;
  error_message?: string;
}

export interface StageProcessor {
  stage_id: string;
  process(context: StageContext): Promise<StageContext>;
  validate_input(input: any): boolean;
  get_output_keys(): string[];
}

export interface PolicyProvider {
  get_stage_policy(stage_id: string): any;
  validate_constraints(stage_id: string, data: any): boolean;
  transform_data(stage_id: string, input: any): any;
}

export interface PipelineConfig {
  stages: string[];
  strict_execution: boolean;
  version: string;
}

export type StageId = 
  | "S0_intake"
  | "S1_normalize" 
  | "S2_constraints"
  | "S3_goal_policy"
  | "S4_corelifts"
  | "S5_role"
  | "S6_body_pref"
  | "S7_body_region"
  | "S8_sub_region"
  | "S9_volume_bucket"
  | "S10_session_structure"
  | "S11_variation_map"
  | "S12_distribution"
  | "S13_protocol"
  | "S14_progression"
  | "S15_deload"
  | "S16_validate"
  | "S17_emit";