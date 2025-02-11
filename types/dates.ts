import {
  CalendarDate,
  CalendarDateTime,
  parseDate,
  parseDateTime,
} from "@internationalized/date";

export type LocaleInfo = {
  locale: string;
  tz: string;
};

export class PortableCalendarDate extends CalendarDate {
  constructor(public dateOrString: CalendarDate | string) {
    let date: CalendarDate;
    if (typeof dateOrString === "string") {
      date = parseDate(dateOrString);
    } else {
      date = dateOrString;
    }
    super(date.year, date.month, date.day);
  }

  toJSON() {
    return this.toString();
  }
}

export class PortableCalendarDateTime extends CalendarDateTime {
  constructor(public dateOrString: CalendarDateTime | string) {
    let date: CalendarDateTime;
    if (typeof dateOrString === "string") {
      date = parseDateTime(dateOrString);
    } else {
      date = dateOrString;
    }
    super(
      date.year,
      date.month,
      date.day,
      date.hour,
      date.minute,
      date.second,
      date.millisecond
    );
  }

  toJSON() {
    return this.toString();
  }
}
