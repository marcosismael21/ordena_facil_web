<template>
  <v-app :theme="'light'"> <!-- Forzamos el tema claro en el layout de login -->
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
onMounted(() => {
  if (process.client) {
    window.localStorage.removeItem('theme')
  }
})
</script>