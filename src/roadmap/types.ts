/**
 * Roadmap Type Definitions
 */

export interface LaunchNotesStage {
  id: string;
  name: string;
  position: number;
}

export interface LaunchNotesWorkItem {
  id: string;
  name: string;
  position: number;
  stageId: string;
}
