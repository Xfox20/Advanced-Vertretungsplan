<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { SubstitutionReportModal as ReportModal } from "#components";

const selectedDate = useSelectedDate();
const plan = inject<Ref<SubstitutionPlan>>("plan")!;
const sub = inject<Substitution>("sub");

const overlay = useOverlay();

const openReportModal = () => {
  overlay.create(ReportModal).open({
    substitution: sub,
    date: selectedDate.value,
    planId: plan.value?.id,
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
