export interface Trigger {
  type: string;
  value: string;
}

export interface Action {
  service: string;
  entity_id: string;
  message?: string; // Thêm cho hành động thông báo
  title?: string;   // Tiêu đề thông báo
}

export type ConditionOperator = ">=" | "=" | "<="

export type ConditionType = "average_temperature" | "sunshine_hours"

export interface NumericWindowConditionValue {
  hours: number
  operator: ConditionOperator
  threshold: number
}

export interface Condition {
  type: ConditionType | string
  value: NumericWindowConditionValue | unknown // Metadata cho condition có thể linh hoạt
}

export interface Device {
  entity_id: string
  name: string
}

export type ConditionMode = "all" | "any"

export interface Automation {
  _id: string
  name: string
  enabled: boolean
  trigger: Trigger
  conditions: Condition[]
  condition_mode?: ConditionMode
  actions: Action[] // Legacy alias: nhánh "thỏa mãn"
  actions_when_matched?: Action[]
  actions_when_unmatched?: Action[]
  last_ran_at?: string
  created_at: string
  updated_at: string
}
