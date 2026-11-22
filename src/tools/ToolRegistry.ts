export class ToolRegistry {
  public execute(plan: string): string {
    return `tool-executed:${plan}`;
  }
}
