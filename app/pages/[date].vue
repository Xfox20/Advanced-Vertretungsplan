<script setup lang="ts">
import { today, isWeekend, parseDate } from "@internationalized/date";

const route = useRoute();
const router = useRouter();

const locale = "de-DE";
const tz = "Europe/Berlin";
provide("locale", { locale, tz } as LocaleInfo);

const todayDate = today(tz);
const selectedDate = shallowRef(parseDate(route.params.date as string));
provide("date", selectedDate);

const updateTitle = () => {
  useHead({
    title: `Vertretungsplan vom ${selectedDate.value
      .toDate(tz)
      .toLocaleDateString(locale)}`,
  });
  router.replace(`/${selectedDate.value.toString()}`);
};
updateTitle();

const {
  status: fetchStatus,
  data,
  refresh,
} = await useFetch<string>(
  () => `/api/plan?date=${selectedDate.value.toString()}`
);

const plan = computed(() => data.value && revivePlan(JSON.parse(data.value)));

const { data: pdfAvailable } = await useAsyncData<boolean>(
  () =>
    $fetch("/pdf?date=" + selectedDate.value!.toString(), {
      method: "HEAD",
    }).then(
      () => true,
      () => false
    ),
  { watch: [selectedDate] }
);

provide("refreshPlan", refresh);
provide("plan", plan);
provide("pdfAvailable", pdfAvailable);

const selectedIsWeekend = computed(() => isWeekend(selectedDate.value, locale));

watch(selectedDate, () => {
  updateTitle();
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
        <template v-else-if="pdfAvailable">
          <p class="mb-2">Es gibt aber eine PDF-Version des Plans.</p>
          <UButton
            icon="i-lucide-file-text"
            label="Öffnen"
            @click="openPdf(selectedDate)"
          />
        </template>
        <p v-else class="text-center">
          Für diesen Tag wurde kein Vertretungsplan gespeichert… Vielleicht sind
          hier auch Ferien.
        </p>
      </main>
    </UContainer>
    <Footer :available="!!plan && !selectedIsWeekend" v-model="selectedDate" />
  </div>
</template>
