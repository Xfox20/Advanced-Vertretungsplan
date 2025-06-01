export default defineEventHandler(async (event) => {
  const classes = await useDrizzle().query.courseClass.findMany();
  return classes.map((c) => c.name).sort();
});
