<script lang="ts" setup>
import { parseDate } from "@internationalized/date";

const route = useRoute();

const { data: report } = useFetch(`/api/admin/report/${route.params.id}`);

type OverrideFormValue = Partial<
  Substitution & {
    classes: string;
    hours: string;
    subject: string;
  }
>;

const overrideSubmission = reactive<OverrideFormValue>({ substitution: {} });

async function submitOverride() {
  const data = {
    ...overrideSubmission,
    classes: overrideSubmission.classes?.split(",").map((c) => c.trim()),
    hours: overrideSubmission.hours?.split(",").map((h) => parseInt(h.trim())),
  };
  console.log(report);

  await Promise.all([
    $fetch(`/api/admin/override`, {
      method: "POST",
      body: {
        date: report.value?.plan.date,
        substitutionId: report.value?.substitution?.id,
        data,
      },
    }),
    $fetch(`/api/admin/report/${route.params.id}/markAsResolved`),
  ]);

  await navigateTo("/admin");
}
</script>

<template>
  <UContainer class="my-8">
    <h1 class="font-bold text-2xl text-center mb-5">Resolve a problem</h1>
    <p>
      Someone reported a problem with this plan. Review the problem and resolve
      it.
    </p>
    <UButton
      icon="i-lucide-file-text"
      variant="subtle"
      block
      label="Open the plan’s
      original PDF"
      class="my-4"
      @click="openPdf(parseDate(report?.plan.date as any))"
    />
    <h2 class="font-bold text-xl mt-3 mb-1.5">Details</h2>
    <ul>
      <li><b>Date:</b> {{ report?.plan.date }}</li>
      <li class="font-bold">
        Reported Problem:
        <span class="text-sm uppercase text-neutral-500">{{
          report?.type
        }}</span>
      </li>
      <li>
        <b>
          Used OCR:
          <span
            :class="`text-[var(--ui-${
              report?.plan.usedOcr ? 'error' : 'success'
            })]`"
          >
            {{ report?.plan.usedOcr ? "YES" : "NO" }}
          </span>
        </b>
      </li>
      <li v-if="report?.plan.notes.length">
        <b>Notes:</b>
        <ul>
          <li v-for="note in report?.plan.notes" class="pl-1 indent-4">
            {{ note }}
          </li>
        </ul>
      </li>
    </ul>
    <template v-if="report?.substitution">
      <p class="font-bold mt-3 mb-2">A substitution was specified:</p>
      <SubstitutionCard
        :substitution="report?.substitution"
        disable-context-menu
      />
    </template>
    <template v-if="report?.substitution">
      <h2 class="font-bold text-xl mt-3 mb-1.5">Provide an override</h2>
      <SubstitutionCardEditable
        :substitution="report?.substitution"
        :state="overrideSubmission"
      />
      <UButton
        icon="i-lucide-send"
        label="Submit"
        block
        loading-auto
        @click="submitOverride"
      />
    </template>
  </UContainer>
</template>
