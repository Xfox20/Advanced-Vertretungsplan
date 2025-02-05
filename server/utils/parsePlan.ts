import fs from "fs";

export async function parsePlan(mdPath: string, date: Date) {
  const markdownFile = fs
    .readFileSync(mdPath, "utf-8")
    .replaceAll("\\.", ".")
    .replaceAll("**", "")
    .replaceAll(/`\s*`/g, "")
    .replaceAll("\r\n", "\n");

  const updatedAt = new Date(
    /Stand: (.*)/i
      .exec(markdownFile)![1]
      .replace(/(\d\d)\.(\d\d)\.(\d\d\d\d)\s(\d\d):(\d\d)/, "$3-$2-$1T$4:$5")
  );

  const notes = /Hinweise:\s*((?:.+?\s+)*?)\s*(?=Aufsichten|\|)/i
    .exec(markdownFile)?.[1]
    ?.trim()
    .match(/[^\n].*?(?=\n+|$)/gis)
    ?.map((m) => m.replaceAll("\n", ""));

  const table = markdownFile
    .match(/\|.+\|/g)
    ?.map((row) => row.slice(1, -1).split("|"));
  const changes = table?.filter((row) => /\d/.test(row[1]));

  const substitutions = changes?.map(parsePdfRow);

  return {
    date,
    updatedAt,
    notes,
    substitutions,
  } as SubstitutionPlan;
}

function parsePdfRow(row: string[]) {
  row = row.map((c) => c.replaceAll("**", "").trim());

  if (row.length < 9 || row.length > 10)
    throw new Error(`Invalid row: ${row.join(" | ")}`);
  if (row.length === 10) {
    if (!row[5]) {
      row.splice(4, 1);
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

  const substitution = {
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

  return {
    classes,
    hours: row[1].match(/\d/g)?.map(Number) || [],
    teacher: row[2],
    subject: row[3],
    room: row[4],
    substitution: Object.values(substitution).every((v) => !v)
      ? undefined
      : substitution,
    note,
  } as Substitution;
}
