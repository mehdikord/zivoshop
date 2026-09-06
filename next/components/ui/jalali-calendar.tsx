"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  gregorianToJalali,
  jalaliToGregorian,
  getJalaliMonthDays,
  getJalaliFirstDayOfWeek,
  getJalaliMonthName,
  toPersianDigits,
  JALALI_WEEKDAYS_SHORT,
  getCurrentJalali,
} from "@/lib/jalali";

interface JalaliCalendarProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function JalaliCalendar({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  className,
  disabled = false,
}: JalaliCalendarProps) {
  const currentJalali = React.useMemo(() => getCurrentJalali(), []);

  const selectedJalali = React.useMemo(
    () => (value ? gregorianToJalali(value) : null),
    [value]
  );

  const [viewMonth, setViewMonth] = React.useState(
    selectedJalali ? selectedJalali.jm : currentJalali.jm
  );
  const [viewYear, setViewYear] = React.useState(
    selectedJalali ? selectedJalali.jy : currentJalali.jy
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      if (selectedJalali) {
        setViewMonth(selectedJalali.jm);
        setViewYear(selectedJalali.jy);
      } else {
        setViewMonth(currentJalali.jm);
        setViewYear(currentJalali.jy);
      }
    }
  };

  const monthDays = getJalaliMonthDays(viewYear, viewMonth);
  const firstDayOfWeek = getJalaliFirstDayOfWeek(viewYear, viewMonth);

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const gregorianDate = jalaliToGregorian(viewYear, viewMonth, day);
    onChange?.(gregorianDate);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  const actualDisplay = value
    ? `${toPersianDigits(gregorianToJalali(value).jy)}/${toPersianDigits(String(gregorianToJalali(value).jm).padStart(2, "0"))}/${toPersianDigits(String(gregorianToJalali(value).jd).padStart(2, "0"))}`
    : null;

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{actualDisplay || placeholder}</span>
          {actualDisplay && (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleClear}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              ×
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        sideOffset={4}
      >
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-semibold">
              {getJalaliMonthName(viewMonth)} {toPersianDigits(viewYear)}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {JALALI_WEEKDAYS_SHORT.map((day) => (
              <div
                key={day}
                className={cn(
                  "h-8 flex items-center justify-center text-xs font-medium",
                  day === "ج" ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {Array.from({ length: monthDays }).map((_, i) => {
              const day = i + 1;
              const isToday =
                currentJalali.jy === viewYear &&
                currentJalali.jm === viewMonth &&
                currentJalali.jd === day;
              const isSelected =
                selectedJalali &&
                selectedJalali.jy === viewYear &&
                selectedJalali.jm === viewMonth &&
                selectedJalali.jd === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "h-8 w-full flex items-center justify-center rounded-md text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                    isToday && !isSelected && "border border-primary text-primary font-semibold",
                    !isSelected && !isToday && "text-foreground"
                  )}
                >
                  {toPersianDigits(day)}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { JalaliCalendar };
