<script lang="ts" setup>
import { CalendarDate } from "@internationalized/date";
import { ReportModal } from "#components";

const { tz, locale } = inject<LocaleInfo>("locale")!;
const selectedDate = inject<Ref<CalendarDate>>("date")!;
const { plan } = defineProps<{ plan: SubstitutionPlan }>();

const reportModal = useModal();
const openReportModal = () => {
  reportModal.open(ReportModal, {
    date: selectedDate?.value,
    tz,
    locale,
    planId: plan.id,
  });
};
</script>

<template>
  <main>
    <!-- heading -->
    <h2 class="text-2xl text-center font-bold mb-3">
      Vertretungsplan
      {{ selectedDate.toDate(tz).toLocaleDateString(locale) }}
    </h2>
    <!-- warning banner for inaccurate data -->
    <p v-if="plan.usedOcr" class="text-[var(--ui-error)]">
      <UIcon name="i-lucide-octagon-alert" class="relative top-[2px]" />
      Achtung: Die aktuellen Daten können sehr ungenau sein.
    </p>
    <!-- last update -->
    <div class="text-gray-600 dark:text-gray-400 font-semibold mb-4">
      Stand:
      {{
        plan.updatedAt.toDate(tz).toLocaleString(locale, {
          dateStyle: "short",
          timeStyle: "short",
        })
      }}
    </div>
    <!-- global notes -->
    <p v-for="note in plan?.notes" class="text-gray-500 mb-1.5">
      <UIcon name="i-lucide-info" class="relative top-[2px]" />
      {{ note }}
    </p>
    <USeparator class="mt-3 mb-6" />
    <!-- list of substitutions -->
    <SubstitutionCard v-for="sub in plan.substitutions" :substitution="sub" />
    <div class="flex flex-col items-center mt-5 gap-1.5">
      <!-- last fetched note -->
      <div class="text-center text-gray-500">
        Zuletzt überprüft:
        {{
          plan.lastFetch.toDate(tz).toLocaleString(locale, {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        }}
      </div>
      <!-- report button -->
      <UButton
        variant="link"
        icon="i-lucide-circle-ellipsis"
        @click="openReportModal"
        class="text-center"
      >
        Problem melden
      </UButton>
    </div>
  </main>
</template>
