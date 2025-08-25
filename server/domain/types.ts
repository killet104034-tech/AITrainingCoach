// 📋 출력 표준
export type Intensity = { type:'%1RM'|'RPE'|'load', value:number };
export type Block = { week:number; day:number; lift:'SQ'|'BP'|'DL'|'ACC'; sets:number; reps:number; intensity:Intensity; notes?:string };
export type ProgramPlan = { meta:{ mesoWeeks:number; engineVersion:string; createdAt:string }, blocks:Block[] };