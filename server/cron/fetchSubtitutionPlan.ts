import { defineCronHandler } from "#nuxt/cron";

export default defineCronHandler("everyFifteenMinutes", fetchPlan);
