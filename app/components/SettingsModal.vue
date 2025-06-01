<script lang="ts" setup>
const { data: availableCourses } = await useFetch<string[]>("/api/classes");

const selectedCourses = useLocalStorage<string[]>("rememberedCourses", []);
</script>

<template>
  <UModal title="Einstellungen">
    <template #body>
      <p class="text-sm mb-4">Einstellungen werden automatisch gespeichert.</p>
      <h2 class="font-bold mb-0.5">Deine Klasse</h2>
      <p class="mb-4">
        Wähle deine Klasse aus. Gegebenenfalls musst du zusätzliche Einträge für
        deine Klassenstufe auswählen.
      </p>
      <USelectMenu
        :items="availableCourses"
        v-model="selectedCourses"
        multiple
        class="w-full"
      />
    </template>
  </UModal>
</template>
