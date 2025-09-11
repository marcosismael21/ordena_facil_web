<template>
  <v-app :theme="'light'"> 
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