import {
  CalendarDate,
  isWeekend,
  parseDate,
  startOfWeek,
  today,
} from "@internationalized/date";

export const useSelectedDate = () => {
  const { tz, locale } = useUserLocale();

  return useState<CalendarDate>("selectedDate", () => {
    const routeDate = useRoute().params.date;
    if (routeDate && typeof routeDate === "string") {
      return parseDate(routeDate);
    }

    let date = today(tz);

    // From 15:00, switch to the next day
    if (new Date().getHours() >= 15) {
      date = date.add({ days: 1 });
    }

    // Skip to Monday if on a weekend
    if (isWeekend(date, locale)) {
      date = startOfWeek(date.add({ weeks: 1 }), locale);
    }

    return date;
  });
};
