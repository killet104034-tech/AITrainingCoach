import type { Stage } from './stage.d.ts';

export async function runPipeline(ctx: any, stages: Stage[], strict: boolean): Promise<any> {
  if (strict && stages.length === 0) {
    throw new Error('STRICT_FAIL');
  }

  let result = ctx;
  
  for (const stage of stages) {
    result = await stage.run(result);
  }
  
  return result;
}