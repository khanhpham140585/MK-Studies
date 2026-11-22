export class Planner {
  public createPlan(prompt: string): string {
    return `plan:${prompt.trim().slice(0, 80)}`;
  }
}
