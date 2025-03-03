import { CalendarDate, CalendarDateTime } from "@internationalized/date";

export type Substitution = {
  id: string;
  classes: string[];
  hours: number[];
  teacher: string | null;
  subject: string | { name: string; type: string };
  room: string | null;
  substitution: {
    teacher?: string | null;
    subject?: string | null;
    room?: string | null;
  } | null;
  note: string | null;
};

export type SubstitutionPlan = {
  id: string;
  date: CalendarDate;
  updatedAt: CalendarDateTime;
  notes: string[];
  substitutions: Substitution[];
  firstFetch: CalendarDateTime;
  lastFetch: CalendarDateTime;
};

export type DeadSubstitutionPlan = {
  [K in keyof SubstitutionPlan]: SubstitutionPlan[K] extends
    | CalendarDate
    | CalendarDateTime
    ? string
    : SubstitutionPlan[K];
};
