<script setup lang="ts">
import { today, isWeekend } from "@internationalized/date";

const router = useRouter();

const { tz, locale } = useUserLocale();

const selectedDate = useSelectedDate();

const {
  status: fetchStatus,
  data,
  refresh,
} = await useFetch<string>(
  () => `/api/plan?date=${selectedDate.value.toString()}`
);

const plan = computed(() => data.value && revivePlan(JSON.parse(data.value)));

const { data: pdfAvailable } = await useAsyncData(
  async () => {
    try {
      await $fetch("/pdf?date=" + selectedDate.value.toString(), {
        method: "HEAD",
      });
      return true;
    } catch {
      return false;
    }
  },
  { watch: [selectedDate] }
);

provide("refreshPlan", refresh);
provide("plan", plan);
provide("pdfAvailable", pdfAvailable);

useHead({
  title: computed(
    () =>
      `Vertretungsplan vom ${selectedDate.value
        .toDate(tz)
        .toLocaleDateString(locale)}`
  ),
});

const selectedDateIsWeekend = computed(() =>
  isWeekend(selectedDate.value, locale)
);
const selectedDateTooFarInFuture = computed(
  () => selectedDate.value.compare(today(tz)) > 0
);

watch(selectedDate, () => {
  router.replace(`/${selectedDate.value.toString()}`);
  if (!selectedDateIsWeekend.value) refresh();
});
</script>

<template>
  <div class="flex flex-col items-center h-screen">
    <UContainer class="px-5 py-8 m-0 grow min-h-none">
      <!-- still loading plan -->
      <main
        v-if="fetchStatus === 'pending'"
        class="flex flex-col items-center justify-center min-h-full"
      >
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
        <h2 class="text-xl font-semibold mt-2">Moment…</h2>
      </main>
      <!-- there is a plan to show -->
      <SubstitutionView
        v-else-if="plan && !selectedDateIsWeekend"
        :plan="plan"
      />
      <!-- there is no plan on this date -->
      <main v-else class="flex flex-col items-center justify-center min-h-full">
        <h2 v-if="selectedDateIsWeekend" class="text-xl font-semibold">
          Wochenende!
        </h2>
        <h2 v-else class="text-xl font-semibold">Kein Plan</h2>
        <p v-if="selectedDateIsWeekend" class="text-center">
          Für diesen Tag gibt es keinen Vertretungsplan.
        </p>
        <p v-else-if="selectedDateTooFarInFuture" class="text-center">
          Dieses Datum liegt zu weit in der Zukunft.
        </p>
        <template v-else-if="pdfAvailable">
          <p class="mb-2">Es gibt aber eine PDF-Version des Plans.</p>
          <UButton
            icon="i-lucide-file-text"
            label="Öffnen"
            :href="'/pdf?date=' + selectedDate.toString()"
            target="_blank"
          />
        </template>
        <p v-else class="text-center">
          Für diesen Tag wurde kein Vertretungsplan gespeichert… Vielleicht sind
          hier auch Ferien.
        </p>
      </main>
    </UContainer>
    <Footer :available="!!plan && !selectedDateIsWeekend" />
  </div>
</template>
