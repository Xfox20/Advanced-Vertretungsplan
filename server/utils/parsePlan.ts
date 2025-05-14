import {
  CalendarDate,
  parseDate,
  parseDateTime,
} from "@internationalized/date";
import crypto from "node:crypto";
import { BatchItem } from "drizzle-orm/batch";

export async function parsePlan(
  downloadHash: string,
  date?: CalendarDate | null
) {
  const markdownBlob = await hubBlob().get(`plans/${downloadHash}/data.md`);
  if (!markdownBlob) throw new Error("File not found");

  const markdown = await markdownBlob
    .text()
    .then((text) =>
      text
        .replaceAll("\\.", ".")
        .replaceAll("**", "")
        .replaceAll(/`\s*`/g, "")
        .replaceAll("\r\n", "\n")
    );

  if (!date) {
    date = parseLocalizedDate(
      markdown.match(/Vertretungsplan .*? (\d+\.\d+\.\d+)/i)![1]
    );
  }

  const updatedAtMatch = /Stand: (.*)/i.exec(markdown);
  const updatedAt = updatedAtMatch && parseLocalizedDateTime(updatedAtMatch[1]);

  const notes =
    /Hinweise:\s*((?:.+?\s+)*?)\s*(?=Aufsichten|\|)/i
      .exec(markdown)?.[1]
      ?.trim()
      .match(/[^\n].*?(?=\n+|$)/gis)
      ?.map((m) => m.replaceAll("\n", "")) || [];

  const table = markdown
    .match(/\|.+\|/g)
    ?.map((row) => row.slice(1, -1).split("|"));
  const changes = table?.filter((row) => /\d/.test(row[1]));

  const substitutions = changes?.map(parsePdfRow) ?? [];

  const parsedPlan = { date, updatedAt, notes, substitutions };

  // Insert plan version
  await useDrizzle()
    .insert(tables.plan)
    .values({
      ...parsedPlan,
      id: downloadHash,
      downloadHash,
    });

  // Insert substitutions
  if (substitutions.length) {
    await useDrizzle().batch(
      substitutions.map(
        (sub) =>
          useDrizzle()
            .insert(tables.substitution)
            .values({
              ...sub,
              planId: downloadHash,
            }) as BatchItem<"sqlite">
      ) as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]]
    );
  }
}

function parsePdfRow(row: string[]) {
  row = row.map((c) => c.replaceAll("**", "").trim());

  if (row.length < 9 || row.length > 10)
    throw new Error(`Invalid row: ${row.join(" | ")}`);
  if (row.length === 10) {
    if (!row[5]) {
      if (!row[4]) {
        row.splice(4, 1);
      } else {
        row.splice(5, 1);
      }
    } else {
      row.splice(-1, 1);
    }
  }

  const sub = row.slice(5);

  let subTeacher, subSubject, subRoom, note;
  if (!sub[0] || (/[A-ZÄÖÜ]{3}/.test(sub[0]) && sub[0].length < 18)) {
    // First column is actually teacher
    subTeacher = sub[0];
    if (!sub[1] || sub[1].length < 24) {
      // Second column is actually subject
      subSubject = sub[1];
      if (!sub[2] || /\d\.\d\d\d|SP\d/i.test(sub[2])) {
        // Third column is actually room
        subRoom = sub[2];
        note = sub[3];
      } else note = sub[2];
    } else note = sub[1];
  } else note = sub[0];

  let substitution: Substitution["substitution"] = {
    teacher: subTeacher,
    subject: subSubject,
    room: subRoom,
  };

  const classes =
    row[0]
      .match(/A?\d+(?:\.\d+|-A?\d+)?/g)
      ?.map(String)
      .flatMap((s) => {
        // Parse ranges
        if (s.includes("-")) {
          const [start, end] = s.split("-").map(Number);
          if (!isNaN(start) && !isNaN(end)) {
            return Array.from({ length: end - start + 1 }, (_, i) =>
              (start + i).toString()
            );
          }
        }
        return [s];
      }) || [];

  if (Object.values(substitution).every((v) => !v)) {
    substitution = null;
  }

  let subject;
  if (
    substitution &&
    !substitution.teacher &&
    !substitution.room &&
    substitution.subject
  ) {
    subject = {
      name: substitution.subject,
      type: row[3],
    };
    substitution = null;
  } else {
    subject = row[3];
  }

  const hours = row[1].match(/\d/g)?.map(Number) || [];
  const teacher = row[2];
  const room = row[4];

  // Generate a unique ID for the substitution
  const subHash = crypto.createHash("sha256");
  [classes, hours, teacher, subject, room]
    .map((c) => JSON.stringify(c))
    .forEach((c) => subHash.update(c));
  const id = subHash.digest("hex").slice(0, 8);

  return {
    id,
    classes,
    hours,
    teacher,
    subject,
    room,
    substitution:
      substitution && Object.values(substitution).every((v) => !v)
        ? undefined
        : substitution,
    note,
  } as Substitution;
}

function parseLocalizedDate(dateString: string) {
  return parseDate(
    dateString.replace(
      /(\d\d)\.(\d\d)\.(\d\d\d\d)/,
      (_, p1, p2, p3) => `${p3}-${p2}-${p1}`
    )
  );
}

function parseLocalizedDateTime(dateString: string) {
  return parseDateTime(
    dateString.replace(
      /(\d\d)\.(\d\d)\.(\d\d\d\d)\s(\d\d):(\d\d)/,
      (_, p1, p2, p3, p4, p5) => `${p3}-${p2}-${p1}T${p4}:${p5}`
    )
  );
}
