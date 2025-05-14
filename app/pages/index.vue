<script lang="ts" setup>
import { today, isWeekend, startOfWeek } from "@internationalized/date";

const router = useRouter();

const locale = "de-DE";
const tz = "Europe/Berlin";

let selectedDate = today(tz);

// From 3 PM, show the next day's plan
if (new Date().getHours() >= 15) {
  selectedDate = selectedDate.add({ days: 1 });
}

// If the current date is a weekend, set it to the next Monday
if (isWeekend(selectedDate, locale)) {
  selectedDate = startOfWeek(selectedDate.add({ weeks: 1 }), locale);
}

router.replace(`/${selectedDate.toString()}`);
</script>

<template />
