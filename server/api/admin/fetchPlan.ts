export default defineEventHandler(async (event) => {
  await authenticate(event);

  await fetchPlan();
});
