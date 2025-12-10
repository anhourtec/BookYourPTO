import { useApi } from '~/composables/useApi'
import type {
  Leave,
  LeaveType,
  PublicHoliday,
  LeaveBalanceSummary,
  CreateLeaveInput,
  UpdateLeaveInput,
} from '~/types/api'

export const useLeaves = () => {
  const { 
    fetchLeaves,
    fetchLeaveBalance,
    fetchLeaveTypes,
    fetchPublicHolidays,
    createLeaveRequest,
    updateLeaveStatus,
    cancelLeaveRequest,
  } = useApi()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const leaves = ref<Leave[]>([])
  const leaveTypes = ref<LeaveType[]>([])
  const publicHolidays = ref<PublicHoliday[]>([])
  const balanceSummary = ref<LeaveBalanceSummary | null>(null)

  const loadLeaveTypes = async () => {
    try {
      leaveTypes.value = await fetchLeaveTypes()
    } catch (e: any) {
      console.error(e)
    }
  }

  const loadCalendarData = async (userId: string, year: number) => {
    loading.value = true
    error.value = null
    try {
      const [leavesData, balanceData, holidaysData] = await Promise.all([
        fetchLeaves(userId, year),
        fetchLeaveBalance(userId, year),
        fetchPublicHolidays(year),
      ])

      leaves.value = leavesData
      balanceSummary.value = balanceData
      publicHolidays.value = holidaysData

      if (!leaveTypes.value.length) {
        await loadLeaveTypes()
      }
    } catch (e: any) {
      console.error('Failed to load calendar data', e)
      error.value = e?.data?.message || e?.message || 'Failed to load calendar data'
    } finally {
      loading.value = false
    }
  }

  const createLeave = async (payload: CreateLeaveInput) => {
    error.value = null
    try {
      const leave = await createLeaveRequest(payload)
      leaves.value.push(leave)
      return leave
    } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'Failed to create leave'
      throw e
    }
  }

  const updateLeave = async (leaveId: string, payload: UpdateLeaveInput) => {
    error.value = null
    try {
      const updated = await updateLeaveStatus(leaveId, payload)
      const idx = leaves.value.findIndex(l => l.id === leaveId)
      if (idx !== -1) {
        const existing = leaves.value[idx]
        if (existing) {
          leaves.value[idx] = updated
        }
      }
      return updated
    } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'Failed to update leave'
      throw e
    }
  }

  const cancelLeave = async (leaveId: string) => {
    error.value = null
    try {
      await cancelLeaveRequest(leaveId)
      const idx = leaves.value.findIndex(l => l.id === leaveId)
      if (idx !== -1) {
        const existing = leaves.value[idx]
        if (existing) {
          existing.status = 'CANCELLED'
        }
      }
    } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'Failed to cancel leave'
      throw e
    }
  }

  const getLeaveTypeById = (id: string) =>
    leaveTypes.value.find(t => t.id === id)

  return {
    // state
    leaves,
    leaveTypes,
    publicHolidays,
    balanceSummary,
    loading,
    error,

    // loaders
    loadCalendarData,
    loadLeaveTypes,

    // actions
    createLeave,
    updateLeave,
    cancelLeave,

    // helpers
    getLeaveTypeById,
  }
}
