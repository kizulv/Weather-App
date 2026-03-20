import { Action } from "@/features/automation/types/automation"

type AutomationActionLike = {
  [key: string]: unknown
  actions_when_matched?: unknown
  actions_when_unmatched?: unknown
  actions?: unknown
}

export interface AutomationActionBranches {
  matchedActions: Action[]
  unmatchedActions: Action[]
}

function toActionList(raw: unknown): Action[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const candidate = item as Partial<Action>
      if (typeof candidate.service !== "string") return null
      if (typeof candidate.entity_id !== "string") return null
      return {
        service: candidate.service,
        entity_id: candidate.entity_id,
      }
    })
    .filter((item): item is Action => item !== null)
}

export function resolveAutomationActionBranches(
  automation: AutomationActionLike
): AutomationActionBranches {
  const matchedSource =
    automation.actions_when_matched !== undefined
      ? automation.actions_when_matched
      : automation.actions

  return {
    matchedActions: toActionList(matchedSource),
    unmatchedActions: toActionList(automation.actions_when_unmatched),
  }
}

export function pickActionsByConditionMatch(
  automation: AutomationActionLike,
  conditionMatched: boolean
) {
  const { matchedActions, unmatchedActions } =
    resolveAutomationActionBranches(automation)
  return conditionMatched ? matchedActions : unmatchedActions
}
