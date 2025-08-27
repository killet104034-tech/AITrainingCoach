export interface Stage {
  id: string;
  run(ctx: any): Promise<any>;
  doc?: string;
}