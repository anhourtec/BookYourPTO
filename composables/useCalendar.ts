import type { Leave, PublicHoliday } from '~/types/api'

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  leaves: Leave[]
  holidays: PublicHoliday[]
}

export interface CalendarMonth {
  monthIndex: number // 0-11
  year: number
  name: string
  weeks: CalendarDay[][]
}

const monthNames = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
] as const

export const useCalendar = () => {
  // Organization timezone - will be loaded from settings
  const orgTimezone = ref<string>('UTC')

  /**
   * Load organization timezone from API
   */
  const loadOrgTimezone = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const settings = await $fetch('/api/organization/settings', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      
      if (settings && typeof settings === 'object' && 'timezone' in settings) {
        orgTimezone.value = (settings as any).timezone || 'UTC'
        console.log('📍 Loaded organization timezone:', orgTimezone.value)
      }
    } catch (error) {
      console.error('Failed to load organization timezone:', error)
      orgTimezone.value = 'UTC'
    }
  }

  /**
   * ✅ Get current date in organization's timezone
   * This is the KEY function that makes "today" work correctly
   */
  const getTodayInOrgTimezone = (): Date => {
    const tz = orgTimezone.value
    const now = new Date()
    
    // Use Intl.DateTimeFormat to get the current date in the org's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    
    const parts = formatter.formatToParts(now)
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '0')
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1')
    
    // Return as a Date object (at midnight local browser time, but representing the org timezone date)
    return new Date(year, month, day, 0, 0, 0, 0)
  }

  /**
   * Get start of day (midnight) for a given date
   */
  const getStartOfDay = (d: Date): Date => {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
  }

  /**
   * Check if two dates are the same day
   */
  const isSameDay = (a: Date, b: Date): boolean => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    )
  }

  /**
   * Check if a date falls between two other dates (inclusive)
   */
  const isBetween = (target: Date, start: Date, end: Date): boolean => {
    const targetTime = getStartOfDay(target).getTime()
    const startTime = getStartOfDay(start).getTime()
    const endTime = getStartOfDay(end).getTime()
    
    return targetTime >= startTime && targetTime <= endTime
  }

  const buildMonth = (
    year: number,
    monthIndex: number,
    leaves: Leave[],
    holidays: PublicHoliday[],
    today: Date // ✅ Pass today as parameter so we use org timezone
  ): CalendarMonth => {
    const firstOfMonth = new Date(year, monthIndex, 1)
    const lastOfMonth = new Date(year, monthIndex + 1, 0)
    const firstDayOfWeek = firstOfMonth.getDay() // 0-6

    const days: CalendarDay[] = []

    // start from Monday or Sunday? using organization weekStartDay later if needed
    const offset = firstDayOfWeek // simple: Sunday = first column

    // days from previous month to fill first week
    for (let i = 0; i < offset; i++) {
      const date = new Date(year, monthIndex, i - offset + 1)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today), // ✅ Compare with org timezone today
        leaves: [],
        holidays: [],
      })
    }

    // days in current month
    for (let d = 1; d <= lastOfMonth.getDate(); d++) {
      const date = new Date(year, monthIndex, d)

      // Filter leaves that span this specific day
      const dayLeaves = leaves.filter(l => {
        const leaveStart = new Date(l.startDate)
        const leaveEnd = new Date(l.endDate)
        return isBetween(date, leaveStart, leaveEnd)
      })

      const dayHolidays = holidays.filter(h =>
        isSameDay(date, new Date(h.date))
      )

      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today), // ✅ Compare with org timezone today
        leaves: dayLeaves,
        holidays: dayHolidays,
      })
    }

    // fill remaining cells to complete last week
    while (days.length > 0 && days.length % 7 !== 0) {
      const lastDay = days[days.length - 1]
      if (!lastDay) break
      const lastDate = lastDay.date
      const date = new Date(lastDate)
      date.setDate(lastDate.getDate() + 1)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today), // ✅ Compare with org timezone today
        leaves: [],
        holidays: [],
      })
    }

    // chunk into weeks
    const weeks: CalendarDay[][] = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }

    return {
      monthIndex,
      year,
      name: monthNames[monthIndex] as string,
      weeks,
    }
  }

  const buildYear = (
    year: number,
    leaves: Leave[],
    holidays: PublicHoliday[]
  ): CalendarMonth[] => {
    // ✅ Get "today" in organization's timezone ONCE
    const today = getTodayInOrgTimezone()
    
    console.log('📅 Building calendar:', {
      orgTimezone: orgTimezone.value,
      todayInOrgTz: today.toDateString(),
      year,
      leavesCount: leaves.length
    })

    const months: CalendarMonth[] = []
    for (let m = 0; m < 12; m++) {
      months.push(buildMonth(year, m, leaves, holidays, today))
    }
    return months
  }

  return {
    buildMonth,
    buildYear,
    isSameDay,
    isBetween,
    getStartOfDay,
    getTodayInOrgTimezone,
    loadOrgTimezone,
    orgTimezone: readonly(orgTimezone),
  }
}