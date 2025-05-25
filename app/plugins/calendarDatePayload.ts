import { CalendarDate, parseDate } from "@internationalized/date";

export default definePayloadPlugin(() => {
  definePayloadReducer("CalendarDate", (value) => {
    return value instanceof CalendarDate && value.toString();
  });
  definePayloadReviver("CalendarDate", (value) => {
    return parseDate(value);
  });
});
