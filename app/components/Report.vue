<script lang="ts" setup>
import { parseDate } from "@internationalized/date";

defineProps({
  report: Object,
});
</script>

<template>
  <NuxtLink
    :to="`/admin/report/${report?.id}`"
    class="flex flex-row justify-between items-center gap-2 hover:bg-gray-100 cursor-pointer p-2 rounded-lg"
  >
    <div>
      <h1 class="text-lg font-semibold text-[var(--ui-text)]">
        {{
          parseDate(report?.plan.date.toString())
            .toDate("Europe/Berlin")
            .toLocaleDateString("de-DE")
        }}
      </h1>
      <p v-if="report?.substitution" class="text-sm text-gray-500 mt-0.5">
        {{
          typeof report?.substitution.subject === "string"
            ? report?.substitution.subject
            : `${report?.substitution.subject.type}: ${report?.substitution.subject.name}`
        }}
        ({{ report.substitution.classes.join(", ") }}) in
        {{ report.substitution.hours.map((h: string) => h + ".").join("/") }}
        hour
      </p>
    </div>
    <div class="font-mono text-sm justify-self-end flex items-center gap-3">
      <span class="text-[var(--ui-error)]">{{ report?.type }}</span>
      <UIcon name="i-lucide-chevron-right" />
    </div>
  </NuxtLink>
</template>
