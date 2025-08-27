import type { Stage } from './stage.d.ts';

const stageRegistry = new Map<string, Stage>();

export function registerStage(stage: Stage): void {
  stageRegistry.set(stage.id, stage);
}

export function getStagesByOrder(stageIds: string[]): Stage[] {
  const stages: Stage[] = [];
  
  for (const id of stageIds) {
    const stage = stageRegistry.get(id);
    if (!stage) {
      throw new Error('STRICT_FAIL');
    }
    stages.push(stage);
  }
  
  return stages;
}