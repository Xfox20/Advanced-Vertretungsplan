<script setup lang="ts">
const selectedDate = useSelectedDate();
const { tz, locale } = useUserLocale();
const pdfAvailable = inject<boolean>("pdfAvailable");

const refresh = inject<() => void>("refreshPlan")!;
</script>

<template>
  <footer
    class="sticky bottom-0 w-screen p-4 bg-[var(--ui-bg)] border-t border-[var(--ui-border)]"
  >
    <div class="flex items-center justify-evenly gap-5 mb-4">
      <UButton
        icon="i-lucide-chevron-left"
        size="sm"
        color="neutral"
        variant="outline"
        @click="selectedDate = selectedDate?.subtract({ days: 1 })"
      />
      <div class="text-lg font-mono text-center">
        <NuxtTime
          :datetime="selectedDate.toDate(tz)"
          :locale
          weekday="short"
          day="numeric"
          month="numeric"
          year="numeric"
        />
      </div>
      <UButton
        icon="i-lucide-chevron-right"
        size="sm"
        color="neutral"
        variant="outline"
        @click="selectedDate = selectedDate?.add({ days: 1 })"
      />
    </div>
    <div class="flex items-center justify-evenly">
      <UButton icon="i-lucide-rotate-cw" variant="ghost" @click="refresh()" />
      <!-- center buttons -->
      <UPopover>
        <UButton icon="i-lucide-calendar" variant="subtle" size="lg" />

        <template #content>
          <UCalendar v-model="selectedDate" size="lg" :week-starts-on="1" />
        </template>
      </UPopover>
      <UButton
        icon="i-lucide-file-text"
        variant="subtle"
        size="lg"
        :disabled="!pdfAvailable"
        :href="'/pdf?date=' + selectedDate?.toString()"
        target="_blank"
      />
      <InfoDrawer><UButton icon="i-lucide-info" variant="ghost" /></InfoDrawer>
    </div>
  </footer>
</template>
