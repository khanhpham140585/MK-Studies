import { Planner } from '../planner/Planner';
import { ToolRegistry } from '../tools/ToolRegistry';
import { MemoryStore } from '../memory/MemoryStore';

export interface AgentOptions {
  memory: MemoryStore;
  planner: Planner;
  tools: ToolRegistry;
}

export class Agent {
  private readonly memory: MemoryStore;
  private readonly planner: Planner;
  private readonly tools: ToolRegistry;

  constructor(options: AgentOptions) {
    this.memory = options.memory;
    this.planner = options.planner;
    this.tools = options.tools;
  }

  public async run(prompt: string): Promise<{ reply: string }> {
    const plan = this.planner.createPlan(prompt);
    const toolOutput = this.tools.execute(plan);

    this.memory.save({ prompt, plan, toolOutput });

    return {
      reply: `Agent received: ${prompt} | Plan: ${plan}`,
    };
  }
}
