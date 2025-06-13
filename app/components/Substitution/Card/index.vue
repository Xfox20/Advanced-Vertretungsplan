<script setup lang="ts">
const { substitution: sub, disableContextMenu } = defineProps<{
  substitution: Substitution;
  disableContextMenu?: boolean;
}>();
provide("sub", sub);

const filteringActive = inject("filteringActive", ref(true));

const gridTemplateClass = computed(() =>
  filteringActive.value
    ? "grid-cols-[2fr_2fr_8fr_6fr_auto]"
    : "grid-cols-[4fr_2fr_2fr_8fr_7fr_auto]"
);
</script>

<template>
  <UCard
    class="p-3 lg:hidden"
    :ui="{
      header: 'p-0! pb-2! flex justify-between',
      body: 'p-0! pt-3! px-1!',
    }"
  >
    <!-- class, subject and hour(s) -->
    <template #header>
      <div>
        <span class="font-semibold">{{
          typeof sub.subject === "string"
            ? sub.subject
            : `${sub.subject.type}: ${sub.subject.name}`
        }}</span>
        <span v-if="!filteringActive"> ({{ sub.classes.join(", ") }})</span>
      </div>
      <div class="flex items-center gap-1 font-light">
        {{
          sub.hours.map((h) => h + ".").join(sub.hours.length < 3 ? "/" : ",")
        }}
        <SubstitutionCardContextMenu v-if="!disableContextMenu" />
      </div>
    </template>
    <!-- in case of substitution: subject, teacher and room -->
    <Substitution />
    <!-- individual note -->
    <div class="text-center">
      <!-- cancellation -->
      <span v-if="/entfällt/i.test(sub.note)" class="text-[var(--ui-error)]">{{
        sub.note
      }}</span>
      <!-- lesson swap -->
      <span
        v-else-if="/tausch/i.test(sub.note)"
        class="text-[var(--ui-warning)]"
        >{{ sub.note }}</span
      >
      <!-- something related to itslearning -->
      <span
        v-else-if="/itslearning/i.test(sub.note)"
        class="inline-flex items-center gap-1.5"
      >
        <img src="/itslearning-square.png" class="w-5 h-5 inline-block" />
        {{ sub.note }}
      </span>
      <!-- anything else -->
      <span v-else>{{ sub.note }}</span>
    </div>
  </UCard>
  <UCard
    class="hidden lg:block"
    :ui="{
      body: ['p-2! grid gap-3 items-center', gridTemplateClass],
    }"
  >
    <span v-if="!filteringActive"> {{ sub.classes.join(", ") }}</span>
    <span class="font-light">
      {{ sub.hours.map((h) => h + ".").join(sub.hours.length < 3 ? "/" : ",") }}
    </span>
    <div class="font-semibold">
      {{
        typeof sub.subject === "string"
          ? sub.subject
          : `${sub.subject.type}: ${sub.subject.name}`
      }}
    </div>
    <div><Substitution /></div>
    <div>{{ sub.note }}</div>
    <SubstitutionCardContextMenu v-if="!disableContextMenu" />
  </UCard>
</template>
