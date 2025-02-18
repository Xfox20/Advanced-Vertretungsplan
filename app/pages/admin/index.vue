<script lang="ts" setup>
import { now, parseDateTime } from "@internationalized/date";

definePageMeta({
  middleware: ["admin"],
});

const { clear: clearSession } = useUserSession();

async function signout() {
  await clearSession();
  await navigateTo("/");
}

const { data: lastFetchString, refresh: refreshLastFetch } = useFetch(
  "/api/admin/lastFetched"
);
const lastFetch = computed(() =>
  lastFetchString.value ? parseDateTime(lastFetchString.value) : undefined
);

const minutesSinceLastFetch = computed(() =>
  lastFetch.value
    ? Math.floor(now("Europe/Berlin").compare(lastFetch.value) / (60 * 1000))
    : undefined
);

async function fetchPlan() {
  await $fetch("/api/admin/fetchPlan");
  await refreshLastFetch();
}
</script>

<template>
  <UContainer class="mt-8">
    <h1 class="text-3xl font-extrabold text-center mb-6">Hey, admin!</h1>
    <UCard class="mb-8">
      <template #header>
        <h2 class="font-bold text-lg">Fetch the plan</h2>
      </template>
      <p v-if="minutesSinceLastFetch && minutesSinceLastFetch < 5" class="mb-2">
        The plan was last fetched
        <span v-if="lastFetch"
          >{{ minutesSinceLastFetch }} minute{{
            minutesSinceLastFetch === 1 ? "" : "s"
          }}</span
        >
        ago. You can re-fetch it now.
      </p>
      <p v-else class="mb-2">
        The plan hasn’t been fetched<span v-if="lastFetch">
          in the past {{ minutesSinceLastFetch }} minutes</span
        >. You can fetch it now.
      </p>
      <UButton
        color="neutral"
        variant="subtle"
        block
        loading-auto
        @click="fetchPlan"
        >Fetch plan</UButton
      >
    </UCard>
    <UCard class="mb-8">
      <template #header>
        <h2 class="font-bold text-lg">Reports</h2>
      </template>
      <p class="text-sm text-center">Looks good! No reports to process.</p>
    </UCard>
    <UCard :ui="{ body: 'flex justify-center' }">
      <template #header>
        <h2 class="font-bold text-lg">Sign out</h2>
      </template>
      <UButton loading-auto @click="signout">Sign out</UButton>
    </UCard>
  </UContainer>
</template>
