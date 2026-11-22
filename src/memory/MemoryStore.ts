export interface MemoryEntry {
  prompt: string;
  plan: string;
  toolOutput: string;
}

export class MemoryStore {
  private readonly entries: MemoryEntry[] = [];

  public save(entry: MemoryEntry): void {
    this.entries.push(entry);
  }

  public list(): MemoryEntry[] {
    return [...this.entries];
  }
}
