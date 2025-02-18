<script setup lang="ts">
import {
  CalendarDate,
  today,
  isWeekend,
  startOfWeek,
} from "@internationalized/date";

const locale = "de-DE";
const tz = "Europe/Berlin";
provide("locale", { locale, tz } as LocaleInfo);

const todayDate = today(tz);
const selectedDate = shallowRef(todayDate);
provide("date", selectedDate);

// If the current date is a weekend, set it to the next Monday
if (isWeekend(selectedDate.value, locale)) {
  selectedDate.value = startOfWeek(
    selectedDate.value.add({ weeks: 1 }),
    locale
  );
}

// From 3 PM, show the next day's plan
if (new Date().getHours() >= 15) {
  selectedDate.value = selectedDate.value.add({ days: 1 });
}

const updateTitle = (date: CalendarDate) => {
  useHead({
    title: `Vertretungsplan vom ${selectedDate.value
      .toDate(tz)
      .toLocaleDateString(locale)}`,
  });
};
updateTitle(selectedDate.value);

const {
  status: fetchStatus,
  data,
  refresh,
} = await useFetch<string>(
  () => `/api/plan?date=${selectedDate.value.toString()}`
);

const plan = computed(() => data.value && revivePlan(JSON.parse(data.value)));

provide("refreshPlan", refresh);
provide("plan", plan);

const selectedIsWeekend = computed(() => isWeekend(selectedDate.value, locale));

watch(selectedDate, () => {
  updateTitle(selectedDate.value);
  if (!selectedIsWeekend.value) refresh();
});
</script>

<template>
  <div class="flex flex-col h-screen">
    <UContainer class="px-5 py-8 m-0 grow min-h-none">
      <!-- still loading plan -->
      <main
        v-if="fetchStatus === 'pending'"
        class="flex flex-col items-center justify-center min-h-full"
      >
        <UIcon name="i-lucide-loader" class="size-6 animate-spin" />
        <h2 class="text-xl font-semibold mt-2">Moment…</h2>
      </main>
      <!-- there is a plan to show -->
      <SubstitutionView v-else-if="plan && !selectedIsWeekend" :plan="plan" />
      <!-- there is no plan on this date -->
      <main v-else class="flex flex-col items-center justify-center min-h-full">
        <h2 v-if="selectedIsWeekend" class="text-xl font-semibold">
          Wochenende!
        </h2>
        <h2 v-else class="text-xl font-semibold">Kein Plan</h2>
        <p v-if="selectedIsWeekend" class="text-center">
          Für diesen Tag gibt es keinen Vertretungsplan.
        </p>
        <p v-else-if="selectedDate.compare(todayDate) > 0" class="text-center">
          Dieses Datum liegt zu weit in der Zukunft.
        </p>
        <p v-else class="text-center">
          Für diesen Tag wurde kein Vertretungsplan gespeichert… Vielleicht sind
          hier auch Ferien.
        </p>
      </main>
    </UContainer>
    <Footer :available="!!plan && !selectedIsWeekend" v-model="selectedDate" />
  </div>
</template>
