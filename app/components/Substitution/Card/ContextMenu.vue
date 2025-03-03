<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { SubstitutionReportModal as ReportModal } from "#components";
import { CalendarDate } from "@internationalized/date";

const selectedDate = inject<Ref<CalendarDate>>("date");
const plan = inject<Ref<SubstitutionPlan>>("plan")!;
const sub = inject<Substitution>("sub");

const reportModal = useModal();
const openReportModal = () => {
  reportModal.open(ReportModal, {
    substitution: sub,
    date: selectedDate?.value,
    planId: plan.value.id,
  });
};

const contextMenu = ref<DropdownMenuItem[]>([
  {
    label: "Problem melden",
    icon: "i-lucide-flag",
    onSelect: openReportModal,
    color: "error",
  },
]);
</script>

<template>
  <UDropdownMenu :items="contextMenu">
    <UButton
      icon="i-lucide-ellipsis"
      variant="ghost"
      color="neutral"
      class="py-0"
    />
  </UDropdownMenu>
</template>
