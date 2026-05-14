/**
 * Shared types for agent-demo hero blocks.
 */

export interface AgentTurn {
  role: "user" | "agent";
  content: string;
  meta?: string;
}
