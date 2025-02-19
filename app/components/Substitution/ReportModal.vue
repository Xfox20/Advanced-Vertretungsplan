<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

const { substitution, date, planId } = defineProps<{
  substitution: Substitution;
  date: CalendarDate;
  planId: string;
}>();

const modal = useModal();

const reportOptions = ref([
  {
    value: "wrong",
    label: "Fehlerhafte Angaben",
    description: "Die Informationen wurden nicht ordentlich extrahiert.",
  },
  {
    value: "missing",
    label: "Fehlende Angaben",
    description: "Es fehlt etwas, wie z.B. eine Spalte.",
  },
  {
    value: "scrambled",
    label: "Etwas ist durcheinandergeraten",
    description: "Die Daten sind total durcheinander oder ergeben keinen Sinn.",
  },
]);
const reportOptionValues = reportOptions.value.map((o) => o.value) as [
  string,
  ...string[]
];

const reportSchema = z.object({
  type: z.enum(reportOptionValues),
});
type Schema = z.output<typeof reportSchema>;

const report = reactive<Partial<Schema>>({ type: undefined });

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<Schema>) {
  Object.assign(event.data, { planId, substitutionId: substitution.id });
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
      {{ substitution.subject }} in der
      {{ substitution.hours.map((h) => h + ".").join("/") }} Stunde
    </template>
    <template #body>
      <p class="mb-4">
        Bitte melde nur ein Problem, wenn diese Informationen nicht dem
        <NuxtLink
          @click="openPdf(date)"
          class="text-[var(--ui-primary)] cursor-pointer"
        >
          originalen Vertretungsplan
        </NuxtLink>
        entsprechen:
      </p>
      <SubstitutionCard :substitution="substitution" disable-context-menu />
      <h3 class="font-bold mb-3">Was ist das Problem?</h3>
      <UForm :state="report" :schema="reportSchema" @submit="onSubmit">
        <URadioGroup :items="reportOptions" v-model="report.type" />
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
