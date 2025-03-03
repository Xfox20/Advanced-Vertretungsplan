<script setup lang="ts">
const { state } = defineProps<{
  state: any;
}>();

const sub = inject<Substitution>("sub");
</script>

<template>
  <div
    v-if="sub?.substitution"
    class="bg-[var(--ui-secondary)]/15 mb-3 p-2.5 rounded-xl border-2 border-[var(--ui-secondary)]"
  >
    <h3 class="font-extrabold uppercase text-[var(--ui-secondary)] mb-0.5">
      Vertretung
    </h3>
    <div
      :class="
        sub.substitution?.room && sub.substitution?.room?.length > 15
          ? 'flex flex-col items-start gap-1'
          : 'flex flex-row justify-between items-center gap-7'
      "
    >
      <div class="flex items-center gap-2">
        <UInput
          v-model="state.subject"
          :placeholder="sub.substitution.subject ?? undefined"
          class="text-sm font-semibold w-20"
        />
        <UInput
          v-model="state.teacher"
          :placeholder="sub.substitution.teacher ?? undefined"
          class="w-16"
        />
      </div>
      <UInput
        v-model="state.room"
        :placeholder="sub.substitution.room ?? undefined"
        :ui="{
          base:
            sub.substitution?.room && sub.substitution.room?.length > 15
              ? 'text-left'
              : 'text-right',
        }"
      />
    </div>
  </div>
</template>
