import * as jalaali from "jalaali-js";

const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const JALALI_WEEKDAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

const JALALI_WEEKDAYS_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

export interface JalaliDateFormatted {
  year: number;
  month: number;
  day: number;
  monthName: string;
  weekday: string;
}

/**
 * Convert Gregorian Date to Jalali
 */
export function gregorianToJalali(date: Date): JalaliDate {
  return jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/**
 * Convert Jalali to Gregorian Date
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  const g = jalaali.toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd);
}

/**
 * Convert ISO date string to Jalali formatted
 */
export function dateToJalali(dateString: string | Date | null | undefined): JalaliDateFormatted | null {
  if (!dateString) return null;
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return null;
    const j = gregorianToJalali(date);
    return {
      year: j.jy,
      month: j.jm,
      day: j.jd,
      monthName: JALALI_MONTHS[j.jm - 1] ?? "",
      weekday: JALALI_WEEKDAYS[j.jd <= 7 ? (j.jd - 1) : j.jd % 7] ?? "",
    };
  } catch {
    return null;
  }
}

/**
 * Format a Gregorian date as Jalali string: ۱۴۰۴/۰۷/۱۵
 */
export function formatJalaliDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "—";
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return "—";
    const j = gregorianToJalali(date);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${j.jy}/${pad(j.jm)}/${pad(j.jd)}`;
  } catch {
    return "—";
  }
}

/**
 * Format Jalali numbers to Persian digits
 */
export function toPersianDigits(input: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(input).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)] ?? d);
}

/**
 * Format Jalali date with Persian digits: ۱۵/۰۷/۱۴۰۴
 */
export function formatJalaliDatePersian(dateString: string | Date | null | undefined): string {
  if (!dateString) return "—";
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return "—";
    const j = gregorianToJalali(date);
    const pad = (n: number) => String(n).padStart(2, "0");
    return toPersianDigits(`${j.jy}/${pad(j.jm)}/${pad(j.jd)}`);
  } catch {
    return "—";
  }
}

/**
 * Format Jalali date as full text: ۱۵ مهر ۱۴۰۴
 */
export function formatJalaliDateFull(dateString: string | Date | null | undefined): string {
  if (!dateString) return "—";
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return "—";
    const j = gregorianToJalali(date);
    return toPersianDigits(`${j.jd} ${JALALI_MONTHS[j.jm - 1]} ${j.jy}`);
  } catch {
    return "—";
  }
}

/**
 * Get number of days in a Jalali month
 */
export function getJalaliMonthDays(jy: number, jm: number): number {
  return jalaali.jalaaliMonthLength(jy, jm);
}

/**
 * Get the first day of a Jalali month (what weekday it falls on)
 * Returns 0=Saturday, 1=Sunday, ..., 5=Thursday, 6=Friday (Iranian week)
 */
export function getJalaliFirstDayOfWeek(jy: number, jm: number): number {
  const gregorian = jalaliToGregorian(jy, jm, 1);
  const day = gregorian.getDay();
  // Convert Sunday=0, Monday=1, ..., Saturday=6 to Iranian week: Sat=0, Sun=1, ..., Fri=6
  return (day + 1) % 7;
}

/**
 * Get current Jalali date
 */
export function getCurrentJalali(): JalaliDate {
  return gregorianToJalali(new Date());
}

/**
 * Get month name in Persian
 */
export function getJalaliMonthName(month: number): string {
  return JALALI_MONTHS[month - 1] || "";
}

/**
 * Format a Gregorian ISO date string to a standard ISO string for database
 * Used when converting back from Jalali selection to Gregorian for API calls
 */
export function jalaliSelectionToGregorianISO(
  jy: number,
  jm: number,
  jd: number
): string {
  const date = jalaliToGregorian(jy, jm, jd);
  return date.toISOString();
}

export { JALALI_MONTHS, JALALI_WEEKDAYS, JALALI_WEEKDAYS_SHORT };
