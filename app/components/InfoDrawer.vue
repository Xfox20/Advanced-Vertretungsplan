<script lang="ts" setup>
const infoContent = ref([
  {
    label: "Hintergrund",
    icon: "i-lucide-info",
    slot: "background",
  },
  {
    label: "Technische Funktionsweise",
    icon: "i-lucide-code",
    slot: "technical",
  },
  {
    label: "Anleitung",
    icon: "i-lucide-user-check",
    slot: "manual",
  },
]);

const commitHash = useRuntimeConfig().public.commitHash;
</script>

<template>
  <UDrawer
    description="Ein Client für den Vertretungsplan des Gymnasiums Reutershagen"
  >
    <slot />
    <template #title>
      <span class="flex items-center gap-1.5">
        Advanced Vertretungsplan
        <UBadge variant="subtle" size="sm" class="uppercase">Beta</UBadge>
      </span>
    </template>
    <template #body>
      <p class="mb-2">
        Dies ist ein kleines inoffizielles Tool, das ich gemacht habe, mit dem
        man sich den Vertretungsplan besser anschauen kann.
      </p>
      <UAccordion :items="infoContent">
        <template #background>
          <p class="text-sm mb-2.5">
            Da der Vertretungsplan außerhalb der Schule nur über itslearning
            verfügbar ist und ich mich dabei jedes Mal über die itslearning-App
            aufregen musste, habe ich diese Web App gemacht.
          </p>
          <p class="text-sm mb-2.5">
            Außerdem wollte ich mal ausprobieren, wie gut so etwas funktionieren
            würde und was ich für ein ein Design hinbekomme.
          </p>
          <p class="text-sm mb-3.5">
            Es ist bei weitem nicht perfekt, eher ein <i>Proof of Concept</i>,
            aber ich hoffe, dass es allen, die sich den Vertretungsplan digital
            anschauen, die Erfahrung etwas besser macht.
          </p>
        </template>
        <template #technical>
          <p class="text-sm mb-2.5">
            Das Umsetzen war ziemlich einfach, abgesehen davon, dass itslearning
            (bzw. der Schulserver MV) keine richtige API anbietet. Deswegen
            musste den gesamten Login-Prozess reverse-engineeren, was echt
            aufwendig war.
          </p>
          <p class="text-sm mb-2.5">
            Aber ich hab es hinbekommen, sodass jetzt automatisch alle 15
            Minuten der Plan aus itslearning heruntergeladen wird. Zum
            Konvertieren der PDF-Datei benutze ich anschließend
            <a
              href="https://products.aspose.app/words/conversion/pdf-to-md"
              target="_blank"
              >eine API</a
            >. Das Ergebnis ist im Markdown-Format und wird dann mit einem
            selbstgeschriebenen Parser analysiert und in der Datenbank
            gespeichert.
          </p>
          <p class="text-sm mb-3.5">
            Hinsichtlich der Web App selbst &ndash; das Ganze läuft auf einem
            Cloudflare-Server über
            <a href="https://hub.nuxt.com" target="_blank">NuxtHub</a>. Das
            Frontend habe ich mit
            <a href="https://ui.nuxt.com" target="_blank">Nuxt UI</a> und
            <a href="https://tailwindcss.com" target="_blank">Tailwind CSS</a>
            gemacht.
          </p>
        </template>
        <template #manual>
          <p class="text-sm mb-2.5">
            Das Meiste ist selbsterklärend, aber hier eine kurze Erklärung der
            Funktionen:
          </p>
          <p class="text-sm mb-2.5">
            Unten in der Mitte ist das ausgewählte Datum, und mit den Pfeilen
            kann man sich einen Tag vor oder zurück bewegen. Mit dem
            <span class="text-[var(--ui-secondary)]">
              <UIcon name="i-lucide-calendar" class="align-[-2px] size-4" />
              Kalender
            </span>
            kann man das Datum auch manuell auswählen.
          </p>
          <p class="text-sm mb-2.5">
            Der
            <span class="text-[var(--ui-secondary)]">
              <UIcon name="i-lucide-rotate-cw" class="align-[-2px] size-4" />
              Reload-Knopf
            </span>
            lädt die Daten erneut vom Server herunter (ist selten erforderlich,
            weil der Plan sowieso nur alle 15 Minuten aktualisiert wird).
          </p>
          <p class="text-sm mb-3.5">
            Und zuletzt: Mit
            <span class="text-[var(--ui-secondary)]">
              <UIcon name="i-lucide-file-text" class="align-[-2px] size-4" />
            </span>
            kann man die originale PDF-Datei herunterladen, falls es mal ein
            Problem gibt.
          </p>
        </template>
      </UAccordion>
      <!-- footer -->
      <p class="text-xs text-center mt-2">
        <NuxtLink
          :href="`https://github.com/Xfox20/Advanced-Vertretungsplan/commit/${commitHash}`"
          target="_blank"
          class="text-[var(--ui-primary)]"
        >
          <UIcon name="i-lucide-github" class="align-[-2px] size-3.5" />
          #{{ commitHash }}
        </NuxtLink>
        &middot;
        <NuxtLink to="/admin">
          <UIcon name="i-lucide-lock" class="align-[-2px] size-3.5" />
          admin
        </NuxtLink>
      </p>
    </template>
  </UDrawer>
</template>
