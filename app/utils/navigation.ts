import { CalendarDate } from "@internationalized/date";

export function openPdf(selectedDate: CalendarDate | undefined) {
  if (selectedDate) {
    window.open(`/pdf?date=${selectedDate.toString()}`, "_blank");
  }
}
