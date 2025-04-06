export function formatDateWithoutHours(isoString: string): string {
  const date = new Date(isoString)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long', // Correct string type for weekday
    year: 'numeric',
    month: '2-digit', // Correct string type for month
    day: '2-digit', // Correct string type for day
  }

  return date.toLocaleDateString('en-GB', options)
}

export function formatDayMonth(date: Date | string) {
  const dateObj = new Date(date)
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
  return dateObj.toLocaleDateString(undefined, options)
}

export function formatDay(isoString: string): string {
  const date = new Date(isoString)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long', // Only include the day of the week
  }

  return date.toLocaleDateString('en-GB', options)
}

// this will be formatted as 01/01/2021
export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }

  return date.toLocaleDateString('en-GB', options)
}

// this will be formatted as  HH:MM
export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }

  return date.toLocaleTimeString('en-GB', options)
}

// this will be formatted as 01 January 2021
export function formatFullDate(isoString: string): string {
  const date = new Date(isoString)
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }

  return date.toLocaleDateString('en-GB', options)
}

export function getHour(isoString: string): number {
  const date = new Date(isoString)
  return date.getHours()
}

// this will be formatted as HH:MM
export function getHourAndMinutes(isoString: string): string {
  const date = new Date(isoString)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export function getDayNumber(isoString: string): number {
  const date = new Date(isoString)
  return date.getDate()
}

export function getMonthAndYear(isoString: string): string {
  const date = new Date(isoString)
  const month = date.getMonth()
  const year = date.getFullYear()
  return `${month + 1}/${year}`
}

// get month year but in format January 2021

export function getMonthAndYearString(isoString: string): string {
  const date = new Date(isoString)
  const month = date.toLocaleDateString('en-GB', { month: 'long' })
  const year = date.getFullYear()
  return `${month} ${year}`
}

export function getDayNumberAndDay(isoString: string): string {
  const date = new Date(isoString)
  const day = date.getDate()
  const dayString = date.toLocaleDateString('en-GB', { weekday: 'short' })
  return `${day} ${dayString}`
}

function getDaySuffix(day: number): string {
  if (day > 3 && day < 21) return 'th' // exceptions for 11th to 13th
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

//function for this example Thursday, October 17th
export function getDayMonthAndDay(isoString: string): string {
  const date = new Date(isoString)
  //weekday
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' })
  const day = date.getDate()
  const month = date.toLocaleDateString('en-GB', { month: 'long' })
  const daySuffix = getDaySuffix(day)
  return `${weekday}, ${month} ${day}${daySuffix}`
}
