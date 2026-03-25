import { Action } from "@/features/automation/types/automation"

export interface ActionBranches {
  matchedActions: Action[]
  unmatchedActions: Action[]
}

interface ActionSource {
  actions?: unknown
  actions_when_matched?: unknown
  actions_when_unmatched?: unknown
}

function isAction(item: unknown): item is Action {
  if (!item || typeof item !== "object") return false
  const candidate = item as Partial<Action>
  return typeof candidate.service === "string" && typeof candidate.entity_id === "string"
}

function toActionList(raw: unknown): Action[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(isAction)
}

/**
 * Phân loại danh sách actions thành các nhóm để hiển thị trên UI.
 * Chấp nhận object chứa các thuộc tính action khác nhau từ DB.
 */
export function resolveAutomationActionBranches(source: ActionSource): ActionBranches {
  const matchedActions = [
    ...toActionList(source.actions_when_matched),
    ...toActionList(source.actions),
  ]
  const unmatchedActions = toActionList(source.actions_when_unmatched)

  return {
    matchedActions,
    unmatchedActions,
  }
}
