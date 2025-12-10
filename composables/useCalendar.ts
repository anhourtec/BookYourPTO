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
  const getStartOfDay = (d: Date) => {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    return x
  }

  const isSameDay = (a: Date, b: Date) =>
    getStartOfDay(a).getTime() === getStartOfDay(b).getTime()

  const isBetween = (target: Date, start: Date, end: Date) => {
    const t = getStartOfDay(target).getTime()
    return t >= getStartOfDay(start).getTime() && t <= getStartOfDay(end).getTime()
  }

  const buildMonth = (
    year: number,
    monthIndex: number,
    leaves: Leave[],
    holidays: PublicHoliday[]
  ): CalendarMonth => {
    const firstOfMonth = new Date(year, monthIndex, 1)
    const lastOfMonth = new Date(year, monthIndex + 1, 0)
    const firstDayOfWeek = firstOfMonth.getDay() // 0-6

    const days: CalendarDay[] = []
    const today = new Date()

    // start from Monday or Sunday? using organization weekStartDay later if needed
    const offset = firstDayOfWeek // simple: Sunday = first column

    // days from previous month to fill first week
    for (let i = 0; i < offset; i++) {
      const date = new Date(year, monthIndex, i - offset + 1)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        leaves: [],
        holidays: [],
      })
    }

    // days in current month
    for (let d = 1; d <= lastOfMonth.getDate(); d++) {
      const date = new Date(year, monthIndex, d)

      const dayLeaves = leaves.filter(l =>
        isBetween(date, new Date(l.startDate), new Date(l.endDate))
      )

      const dayHolidays = holidays.filter(h =>
        isSameDay(date, new Date(h.date))
      )

      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        leaves: dayLeaves,
        holidays: dayHolidays,
      })
    }

    // fill remaining cells to complete last week (up to 6 rows total)
    while (days.length > 0 && days.length % 7 !== 0) {
      const lastDay = days[days.length - 1]
      if (!lastDay) break
      const lastDate = lastDay.date
      const date = new Date(lastDate)
      date.setDate(lastDate.getDate() + 1)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
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
    const months: CalendarMonth[] = []
    for (let m = 0; m < 12; m++) {
      months.push(buildMonth(year, m, leaves, holidays))
    }
    return months
  }

  return {
    buildMonth,
    buildYear,
    isSameDay,
    isBetween,
    getStartOfDay,
  }
}
