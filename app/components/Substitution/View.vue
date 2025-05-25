<script lang="ts" setup>
import { CalendarDate } from "@internationalized/date";
import { ReportModal } from "#components";

const { tz, locale } = useUserLocale();
const selectedDate = useSelectedDate();
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
    <!-- subtitle -->
    <p class="text-sm font-semibold text-gray-500 text-center">
      Gymnasium Reutershagen
    </p>
    <!-- heading -->
    <h2 class="text-xl text-center font-bold mb-4">
      Vertretungsplan für
      {{
        selectedDate.toDate(tz).toLocaleDateString(locale, { weekday: "long" })
      }}, den
      {{
        selectedDate
          .toDate(tz)
          .toLocaleDateString(locale, { dateStyle: "medium" })
      }}
    </h2>
    <!-- warning banner for inaccurate data -->
    <p v-if="plan.faulty" class="text-[var(--ui-error)]">
      <UIcon name="i-lucide-octagon-alert" class="relative top-[2px]" />
      Achtung: Die aktuellen Daten können sehr ungenau sein.
    </p>
    <!-- last update -->
    <div class="text-gray-600 dark:text-gray-400 font-semibold mb-4">
      Stand:
      {{
        plan.updatedAt?.toDate(tz).toLocaleString(locale, {
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
