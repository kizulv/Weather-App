"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Pencil, Play, Zap } from "lucide-react"
import { AutomationLogList } from "./shared/AutomationLogList"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  Action,
  Automation,
  Condition,
  ConditionMode,
  Device,
  LastStateDeviceConditionValue,
  NumericWindowConditionValue,
  PersonIsHomeConditionValue,
  Trigger,
} from "@/features/automation/types/automation"

import {
  ConditionTestResult,
  getDefaultConditionValue,
  normalizeCondition,
} from "./conditions/AutomationConditionsSection"
import { AutomationActionsSection } from "./actions/AutomationActionsSection"
import { AutomationConditionsSection } from "./conditions/AutomationConditionsSection"
import { AutomationTriggerSection } from "./triggers/AutomationTriggerSection"
import {
  checkConditionsAction,
  executeAutomationAction,
} from "@/features/automation/automation.actions"
import { getHADevicesAction } from "@/features/setting/home-assistant.actions"

interface AutomationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  automation: Automation | null
  onSave: (data: Partial<Automation>) => void
}

type ActionBranch = "matched" | "unmatched"

function getInitialMatchedActions(automation: Automation | null): Action[] {
  if (Array.isArray(automation?.actions_when_matched)) {
    return automation.actions_when_matched
  }
  if (Array.isArray(automation?.actions)) {
    return automation.actions
  }
  return [{ service: "switch.turn_on", entity_id: "" }]
}

function getInitialUnmatchedActions(automation: Automation | null): Action[] {
  if (Array.isArray(automation?.actions_when_unmatched)) {
    return automation.actions_when_unmatched
  }
  return []
}

export function AutomationDialog({
  open,
  onOpenChange,
  automation,
  onSave,
}: AutomationDialogProps) {
  const [name, setName] = useState(automation?.name || "")
  const [trigger, setTrigger] = useState<Trigger>(
    automation?.trigger || { type: "time", value: "08:00" }
  )
  const [conditions, setConditions] = useState<Condition[]>(
    automation?.conditions?.map((condition: Condition) => normalizeCondition(condition)) || []
  )
  const [conditionMode, setConditionMode] = useState<ConditionMode>(
    automation?.condition_mode === "any" ? "any" : "all"
  )
  const [actionsWhenMatched, setActionsWhenMatched] = useState<Action[]>(
    getInitialMatchedActions(automation)
  )
  const [actionsWhenUnmatched, setActionsWhenUnmatched] = useState<Action[]>(
    getInitialUnmatchedActions(automation)
  )
  const [devices, setDevices] = useState<Device[]>([])
  const [isEditingName, setIsEditingName] = useState(false)
  const [isTestingConditions, setIsTestingConditions] = useState(false)
  const [conditionTestResult, setConditionTestResult] = useState<ConditionTestResult | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [refreshLogs, setRefreshLogs] = useState(0)

  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName(automation?.name || "")
      setTrigger(automation?.trigger || { type: "time", value: "08:00" })
      setConditions(automation?.conditions?.map((condition: Condition) => normalizeCondition(condition)) || [])
      setConditionMode(automation?.condition_mode === "any" ? "any" : "all")
      setActionsWhenMatched(getInitialMatchedActions(automation))
      setActionsWhenUnmatched(getInitialUnmatchedActions(automation))
    }
  }, [open, automation])

  useEffect(() => {
    const fetchDevices = async () => {
      const result = await getHADevicesAction()
      if (result.success) setDevices(result.data || [])
    }

    if (open) fetchDevices()
  }, [open])

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [isEditingName])

  useEffect(() => {
    if (!open) {
      setConditionTestResult(null)
      setIsTestingConditions(false)
    }
  }, [open])

  useEffect(() => {
    setConditionTestResult(null)
  }, [conditions, conditionMode, trigger.type, trigger.value])

  const normalizedConditions = conditions.map((condition) => normalizeCondition(condition))

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        type: "average_temperature",
        value: getDefaultConditionValue("average_temperature"),
      },
    ])
  }

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const updateCondition = (index: number, nextCondition: Condition) => {
    setConditions(
      conditions.map((condition, i) =>
        i === index ? normalizeCondition(nextCondition) : condition
      )
    )
  }

  const runConditionEvaluation = async ({
    ignoreTrigger = false,
    showToast = true,
  }: {
    ignoreTrigger?: boolean
    showToast?: boolean
  } = {}) => {
    setIsTestingConditions(true)
    try {
      const result = await checkConditionsAction({
        conditions: normalizedConditions,
        mode: conditionMode,
        trigger: ignoreTrigger ? undefined : trigger
      })
      
      if (!result.success) {
        if (showToast) {
          toast.error(result.message || "Không thể kiểm thử điều kiện")
        }
        return null
      }

      const testResult = result.data as ConditionTestResult
      setConditionTestResult(testResult)
      if (showToast) {
        if (testResult.hasEvaluableConditions) {
          toast.success(testResult.matched ? "Điều kiện đang thỏa mãn" : "Điều kiện chưa thỏa mãn")
        } else {
          toast.info("Không có điều kiện hợp lệ để kiểm thử")
        }
      }
      return testResult
    } catch (error) {
      console.error("Lỗi kiểm thử điều kiện:", error)
      if (showToast) {
        toast.error("Lỗi kết nối khi kiểm thử điều kiện")
      }
      return null
    } finally {
      setIsTestingConditions(false)
    }
  }

  const runConditionTest = async () => {
    await runConditionEvaluation()
  }

  const addAction = (branch: ActionBranch, type: "device" | "notification") => {
    const newAction: Action = type === "notification" 
      ? { service: "notify.", entity_id: "", title: "", message: "" }
      : { service: "switch.turn_on", entity_id: "" }

    if (branch === "matched") {
      setActionsWhenMatched((prev) => [...prev, newAction])
      return
    }
    setActionsWhenUnmatched((prev) => [...prev, newAction])
  }

  const removeAction = (branch: ActionBranch, index: number) => {
    if (branch === "matched") {
      setActionsWhenMatched((prev) => prev.filter((_, i) => i !== index))
      return
    }
    setActionsWhenUnmatched((prev) => prev.filter((_, i) => i !== index))
  }

  const updateAction = (
    branch: ActionBranch,
    index: number,
    patch: Partial<Action>
  ) => {
    if (branch === "matched") {
      setActionsWhenMatched((prev) =>
        prev.map((action, i) => (i === index ? { ...action, ...patch } : action))
      )
      return
    }
    setActionsWhenUnmatched((prev) =>
      prev.map((action, i) => (i === index ? { ...action, ...patch } : action))
    )
  }


  const runWorkflowByCondition = async () => {
    const conditionResult = await runConditionEvaluation({
      ignoreTrigger: true,
      showToast: false,
    })
    if (!conditionResult) return

    const actionsToRun = conditionResult.matched
      ? actionsWhenMatched
      : actionsWhenUnmatched

    if (actionsToRun.length === 0) {
      toast.info(
        conditionResult.matched
          ? "Nhánh thỏa mãn điều kiện chưa có hành động"
          : "Nhánh không thỏa mãn điều kiện chưa có hành động"
      )
      return
    }

    toast.info(
      conditionResult.matched
        ? "Điều kiện đạt, đang chạy hành động nhánh thỏa mãn..."
        : "Điều kiện không đạt, đang chạy hành động nhánh không thỏa mãn..."
    )
    if (actionsToRun.length > 0) {
      try {
        if (!automation?._id) {
          toast.error("Không thể chạy thử tự động hóa chưa được lưu.")
          return
        }
        const result = await executeAutomationAction(automation._id)
        if (result.success) {
          toast.success(result.message)
          setRefreshLogs(prev => prev + 1)
        } else {
          toast.error("Thực thi các hành động thất bại")
        }
      } catch (err) {
        console.error("Lỗi thực thi hàng loạt:", err)
        toast.error("Lỗi kết nối tới API Server")
      }
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setIsEditingName(true);
      toast.error("Vui lòng nhập tên tự động hóa")
      return
    }
    const allActions = [...actionsWhenMatched, ...actionsWhenUnmatched]
    if (allActions.some((action) => !action.service.startsWith("notify.") && !action.entity_id)) {
      toast.error("Vui lòng chọn thiết bị cho các hành động điều khiển")
      return
    }

    const normalizedConditions = conditions.map(normalizeCondition)
    const hasInvalidCondition = normalizedConditions.some((condition) => {
      if (condition.type === "last_state_device") {
        const value = condition.value as LastStateDeviceConditionValue
        return !value.entity_id || !Number.isFinite(value.minutes)
      }
      if (condition.type === "person_is_home") {
        const value = condition.value as PersonIsHomeConditionValue
        return !value.entity_id || !value.state
      }
      const value = condition.value as NumericWindowConditionValue
      return !Number.isFinite(value.hours) || !Number.isFinite(value.threshold)
    })
    if (hasInvalidCondition) {
      toast.error("Điều kiện chưa hợp lệ, vui lòng kiểm tra lại")
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        name,
        trigger,
        conditions: normalizedConditions,
        condition_mode: conditionMode,
        actions: actionsWhenMatched,
        actions_when_matched: actionsWhenMatched,
        actions_when_unmatched: actionsWhenUnmatched,
      })
    } catch (err) {
      console.error("Lỗi khi lưu kịch bản:", err)
      toast.error("Lỗi khi lưu kịch bản")
    } finally {
      setIsSaving(false)
    }
  }

  const hasAnyAction = actionsWhenMatched.length > 0 || actionsWhenUnmatched.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="sm:max-w-165 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 text-white rounded-2xl p-0 overflow-hidden shadow-2xl focus:outline-none text-xs"
      >
        <DialogHeader className="relative px-6 py-4 border-b border-slate-800/30">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div
              className={cn(
                "p-1.5 rounded-xl transition-all duration-500",
                "bg-slate-800/40 text-slate-300 shadow-lg border border-slate-700/50"
              )}
            >
              <Zap className="h-4 w-4 fill-current" />
            </div>

            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <input
                  ref={nameInputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setIsEditingName(false)
                    if (e.key === "Escape") setIsEditingName(false)
                  }}
                  placeholder="Tên kịch bản..."
                  className="w-full bg-transparent text-white outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-b border-emerald-500/50 pb-1 placeholder:text-white/20"
                />
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="group/name flex items-center gap-2 w-full text-left outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <DialogTitle className="text-sm font-bold text-white truncate">
                    {name || "Kịch bản mới"}
                  </DialogTitle>
                  <Pencil className="h-3 w-3 text-slate-500 opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0" />
                </button>
              )}
            </div>
          </div>

          <DialogDescription className="sr-only">
            Thiết lập kịch bản tự động điều khiển thiết bị
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-5 overflow-y-auto max-h-[65vh] [scrollbar-color:rgba(96,165,250,0.55)_rgba(15,23,42,0.4)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-900/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-slate-800/60 [&::-webkit-scrollbar-thumb]:bg-blue-400/45 [&::-webkit-scrollbar-thumb:hover]:bg-blue-300/55">
          <AutomationTriggerSection
            trigger={trigger}
            onTriggerChange={setTrigger}
          />

          <AutomationConditionsSection
            conditions={conditions}
            devices={devices}
            conditionMode={conditionMode}
            isTestingConditions={isTestingConditions}
            conditionTestResult={conditionTestResult}
            onConditionModeChange={setConditionMode}
            onRunConditionTest={runConditionTest}
            onAddCondition={addCondition}
            onRemoveCondition={removeCondition}
            onUpdateCondition={updateCondition}
          />

          <AutomationActionsSection
            title="Hành động khi thỏa mãn điều kiện"
            actions={actionsWhenMatched}
            devices={devices}
            onAddAction={(type) => addAction("matched", type)}
            onRemoveAction={(index) => removeAction("matched", index)}
            onUpdateAction={(index, patch) => updateAction("matched", index, patch)}
          />

          <AutomationActionsSection
            title="Hành động khi không thỏa mãn điều kiện"
            actions={actionsWhenUnmatched}
            devices={devices}
            onAddAction={(type) => addAction("unmatched", type)}
            onRemoveAction={(index) => removeAction("unmatched", index)}
            onUpdateAction={(index, patch) => updateAction("unmatched", index, patch)}
          />

          {automation?._id && (
            <AutomationLogList 
              automationId={automation._id} 
              devices={devices}
              refreshTrigger={refreshLogs}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/5 px-6 py-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-sm h-9 px-3 text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            Hủy
          </Button>
          <div className="ml-auto flex items-center gap-2">
            {hasAnyAction && (
              <Button
                variant="outline"
                onClick={runWorkflowByCondition}
                className="text-xs rounded-sm h-9 px-4 bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/15 hover:text-amber-400 font-medium transition-all"
              >
                <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
                Chạy thử
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-sm h-9 px-5 bg-emerald-600/30 border border-emerald-500/40 hover:bg-emerald-600/40 text-xs font-semibold transition-all text-white disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu kịch bản"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
