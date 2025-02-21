<script setup lang="ts">
const { substitution: sub, state } = defineProps<{
  substitution: Substitution;
  state: any;
}>();
provide("sub", sub);
provide("state", state);
</script>

<template>
  <UForm :state="state">
    <UCard
      class="p-3 mb-5"
      :ui="{
        header: 'p-0 pb-2 flex justify-between',
        body: 'p-0 pt-3 px-1',
      }"
    >
      <template #header>
        <div>
          <UInput
            v-model="state.subject"
            :placeholder="
              typeof sub.subject === 'string'
                ? sub.subject
                : `${sub.subject.type}: ${sub.subject.name}`
            "
            class="font-semibold w-25 mr-1"
          />
          <UInput
            v-model="state.classes"
            :placeholder="sub.classes.join(', ')"
            class="w-40"
          />
        </div>
        <UInput
          v-model="state.hours"
          :placeholder="
            sub.hours.map((h) => h + '.').join(sub.hours.length < 3 ? '/' : ',')
          "
          class="w-14"
        />
      </template>
      <SubstitutionEditable :state="state.substitution!" />
      <div class="mb-2">
        Original room:
        <UInput
          v-model="state.room"
          :placeholder="sub.room || ''"
          size="sm"
          class="w-18"
        />
      </div>
      <div class="mt-2">
        Note:
        <UInput
          v-model="state.note"
          :placeholder="sub.note || ''"
          class="text-center"
        />
      </div>
    </UCard>
  </UForm>
</template>
