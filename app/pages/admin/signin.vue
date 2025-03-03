<script lang="ts" setup>
import { z } from "zod";

const { fetch: refreshSession } = useUserSession();

const credentials = reactive({
  password: undefined,
});

const formSchema = z.object({
  password: z.string(),
});

const toast = useToast();

async function signin() {
  $fetch("/api/admin/signin", {
    method: "POST",
    body: credentials,
  })
    .then(async () => {
      await refreshSession();
      await navigateTo("/admin");
      console.log(useUserSession().user.value);
    })
    .catch(() => toast.add({ title: "Invalid password", color: "error" }));
}
</script>

<template>
  <UContainer class="flex justify-center mt-20">
    <UCard class="w-96">
      <h1 class="text-2xl font-extrabold text-center mb-3">Admin Sign In</h1>
      <p class="text-sm mb-5">
        Als normale(r) Besucher*in bist du hier wahrscheinlich falsch.
      </p>
      <UForm :schema="formSchema" :state="credentials" @submit="signin">
        <UFormField label="Password">
          <UInput
            v-model="credentials.password"
            type="password"
            icon="i-lucide-key-round"
          />
        </UFormField>
        <UButton type="submit" class="mt-3">Sign In</UButton>
      </UForm>
    </UCard>
  </UContainer>
</template>
