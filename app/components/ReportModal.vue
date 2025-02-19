<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

const { date, tz, locale, planId } = defineProps<{
  date: CalendarDate;
  tz: string;
  locale: string;
  planId: string;
}>();

const modal = useModal();

const reportOptions = ref([
  {
    value: "missing",
    label: "Fehlende Einträge",
    description: "Einige Einträge aus dem ursprünglichen Plan fehlen.",
  },
  {
    value: "many-missing",
    label: "Viele fehlende Einträge",
    description: "Es fehlt ein Großteil der Einträge / es sind gar keine da.",
  },
  {
    value: "info",
    label: "Die Hinweise sind nicht korrekt",
    description:
      "Die Informationen oben fehlen oder haben ein anderes Problem.",
  },
  {
    value: "other",
    label: "Anderes Problem",
    description: "Es gibt ein anderes Problem, das hier nicht aufgelistet ist.",
  },
]);
const reportOptionValues = reportOptions.value.map((o) => o.value) as [
  string,
  ...string[]
];

const reportSchema = z.object({
  type: z.enum(reportOptionValues),
  comment: z.string().optional(),
});
type Schema = z.output<typeof reportSchema>;

const report = reactive<Partial<Schema>>({
  type: undefined,
  comment: undefined,
});

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<Schema>) {
  Object.assign(event.data, { planId });
  await $fetch("/api/report", {
    method: "POST",
    body: JSON.stringify(event.data),
  })
    .then(() => toast.add({ title: "Problem gemeldet" }))
    .catch(() =>
      toast.add({ title: "Fehler beim Melden des Problems", color: "error" })
    )
    .finally(modal.close);
}
</script>

<template>
  <UModal title="Problem melden">
    <template #description>
      Vertretungsplan vom {{ date.toDate(tz).toLocaleDateString(locale) }}
    </template>
    <template #body>
      <p class="mb-4">
        Wenn es ein Problem mit einem einzelnen Eintrag gibt, benutze bitte das
        <span class="text-[var(--ui-secondary)]">
          <UIcon name="i-lucide-ellipsis" class="align-[-4px] size-5" />
          Kontextmenü</span
        >.
      </p>
      <h3 class="font-bold mb-2">Was ist das Problem?</h3>
      <UForm :state="report" :schema="reportSchema" @submit="onSubmit">
        <URadioGroup :items="reportOptions" v-model="report.type" />
        <UInput
          v-if="report.type === 'other'"
          variant="subtle"
          v-model="report.comment"
          class="mt-3"
        />
        <div class="flex gap-2 mt-5">
          <UButton color="primary" type="submit">Absenden</UButton>
          <UButton color="neutral" variant="outline" @click="modal.close"
            >Abbrechen</UButton
          >
        </div>
      </UForm>
    </template>
  </UModal>
</template>
