export interface Trigger {
  type: string;
  value: string;
}

export interface Action {
  service: string;
  entity_id: string;
}

export interface Condition {
  type: string;
  value: unknown; // Metadata cho condition có thể linh hoạt
}

export interface Device {
  entity_id: string;
  name: string;
}

export interface Automation {
  _id: string;
  name: string;
  enabled: boolean;
  trigger: Trigger;
  conditions: Condition[];
  actions: Action[];
  last_ran_at?: string;
  created_at: string;
  updated_at: string;
}
