<script lang="ts" setup>
import { ReportModal } from "#components";

const { tz, locale } = useUserLocale();
const selectedDate = useSelectedDate();
const { plan } = defineProps<{ plan: SubstitutionPlan }>();

const overlay = useOverlay();

const openReportModal = () => {
  overlay.create(ReportModal).open({
    date: selectedDate?.value,
    tz,
    locale,
    planId: plan.id,
  });
};

const filteringEnabled = ref(true);
const isMounted = ref(false);
const rememberedCourses = computed(() =>
  isMounted.value
    ? useLocalStorage<string[]>("rememberedCourses", []).value
    : []
);

onMounted(() => (isMounted.value = true));

const relevantSubstitutions = computed(() => {
  if (!filteringEnabled.value || !rememberedCourses.value.length) {
    return plan.substitutions;
  }
  return plan.substitutions.filter((s) =>
    s.classes.some((c) => rememberedCourses.value.includes(c))
  );
});

provide(
  "filteringActive",
  computed(() => filteringEnabled.value && !!rememberedCourses.value.length)
);
</script>

<template>
  <main>
    <!-- subtitle -->
    <p class="text-sm font-semibold text-gray-500 text-center">
      Gymnasium Reutershagen
    </p>
    <!-- heading -->
    <h2 class="text-xl text-center font-bold mb-4">
      Vertretungsplan für
      <NuxtTime :datetime="selectedDate.toDate(tz)" :locale weekday="long" />,
      den
      <NuxtTime
        :datetime="selectedDate.toDate(tz)"
        :locale
        date-style="medium"
      />
    </h2>
    <!-- warning banner for inaccurate data -->
    <p v-if="plan.faulty" class="text-[var(--ui-error)]">
      <UIcon name="i-lucide-octagon-alert" class="relative top-[2px]" />
      Achtung: Die aktuellen Daten können sehr ungenau sein.
    </p>
    <!-- last update -->
    <div class="text-gray-600 dark:text-gray-400 font-semibold mb-4">
      Stand:
      <NuxtTime
        :datetime="plan.updatedAt?.toDate(tz)"
        :locale
        date-style="short"
        time-style="short"
      />
    </div>
    <!-- global notes -->
    <p v-for="note in plan?.notes" class="text-gray-500 mb-1.5">
      <UIcon name="i-lucide-info" class="relative top-[2px]" />
      {{ note }}
    </p>
    <USeparator class="mt-3 mb-5" />
    <!-- list of substitutions -->
    <template v-if="isMounted">
      <div
        v-if="rememberedCourses.length"
        class="flex items-center justify-between px-2 my-5"
      >
        <span class="flex items-center gap-2.5">
          <UIcon name="i-lucide-filter" size="18" />
          <span class="text-sm font-semibold">
            <div>
              Filterung nach Klasse{{ rememberedCourses.length > 2 ? "n" : "" }}
            </div>
            <div class="text-xs/3 text-gray-500">
              {{ rememberedCourses.sort().join(", ") }}
            </div>
          </span>
        </span>
        <USwitch v-model="filteringEnabled" size="sm" />
      </div>
      <div class="flex flex-col gap-5 md:grid md:grid-cols-2 lg:flex">
        <SubstitutionCard
          v-for="sub in relevantSubstitutions"
          :substitution="sub"
        />
      </div>
    </template>
    <template v-else>
      <div class="flex items-center justify-center h-20">
        <UIcon name="i-lucide-loader-circle" class="animate-spin" />
      </div>
    </template>
    <div
      class="flex flex-col items-center text-center text-gray-500 mt-5 gap-0.5"
    >
      <p v-if="!relevantSubstitutions.length" class="my-2">
        Keine Vertretungen unter diesem Filter.
      </p>
      <!-- last fetched note -->
      <p>
        Zuletzt überprüft:
        {{
          plan.lastFetch.toDate(tz).toLocaleString(locale, {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        }}
      </p>
      <!-- report button -->
      <UButton
        variant="link"
        icon="i-lucide-circle-ellipsis"
        @click="openReportModal"
        class="text-center"
      >
        Problem melden
      </UButton>
    </div>
  </main>
</template>
