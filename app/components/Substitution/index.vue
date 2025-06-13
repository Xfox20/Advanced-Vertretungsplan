<script setup lang="ts">
const sub = inject<Substitution>("sub");
const filteringActive = inject("filteringActive", ref(true));

const hasRoomChange = computed(
  () =>
    sub.room && sub.substitution?.room && sub.substitution?.room !== sub.room
);
</script>

<template>
  <div
    v-if="sub.substitution"
    class="bg-[var(--ui-secondary)]/15 mb-3 p-2.5 rounded-xl border-2 border-[var(--ui-secondary)] lg:hidden"
  >
    <h3 class="font-extrabold uppercase text-[var(--ui-secondary)] mb-0.5">
      Vertretung
    </h3>
    <!-- if the room is really long, change the layout -->
    <div
      :class="
        sub.substitution?.room?.length > 15
          ? 'flex flex-col items-start gap-1'
          : 'flex flex-row justify-between items-center gap-7'
      "
    >
      <!-- subject & teacher -->
      <div class="flex items-center gap-2">
        <span
          v-if="sub.substitution.subject"
          class="text-sm font-semibold uppercase border border-neutral-600 dark:border-neutral-400 text-neutral-600 dark:text-neutral-400 rounded-sm px-1"
        >
          {{ sub.substitution.subject }}
        </span>
        <span v-if="sub.substitution.teacher">{{
          sub.substitution.teacher
        }}</span>
      </div>
      <span
        :class="sub.substitution.room?.length > 15 ? 'text-left' : 'text-right'"
      >
        <!-- in case there's a room change -->
        <span v-if="hasRoomChange"> {{ sub.room }} &rarr; </span>
        <!-- the room itself -->
        <span :class="{ 'font-bold': hasRoomChange }">
          {{ sub.substitution.room }}
        </span>
      </span>
    </div>
  </div>
  <div
    v-if="sub.substitution"
    class="bg-[var(--ui-secondary)]/15 p-1.5 rounded-md border-[1.5px] border-[var(--ui-secondary)] hidden lg:flex items-center gap-3"
  >
    <h3
      v-if="filteringActive"
      class="font-extrabold text-[var(--ui-secondary)]"
    >
      Vertr.
    </h3>
    <div
      :class="
        sub.substitution?.room?.length > 15
          ? 'flex flex-col items-start gap-1'
          : 'flex flex-row justify-between items-center gap-7 w-full'
      "
    >
      <!-- subject & teacher -->
      <div class="flex items-center gap-2">
        <span
          v-if="sub.substitution.subject"
          class="text-sm font-semibold uppercase border border-neutral-600 dark:border-neutral-400 text-neutral-600 dark:text-neutral-400 rounded-sm px-1"
        >
          {{ sub.substitution.subject }}
        </span>
        <span v-if="sub.substitution.teacher">{{
          sub.substitution.teacher
        }}</span>
      </div>
      <span
        :class="sub.substitution.room?.length > 15 ? 'text-left' : 'text-right'"
      >
        <!-- in case there's a room change -->
        <span v-if="hasRoomChange"> {{ sub.room }} &rarr; </span>
        <!-- the room itself -->
        <span :class="{ 'font-bold': hasRoomChange }">
          {{ sub.substitution.room }}
        </span>
      </span>
    </div>
  </div>
</template>
