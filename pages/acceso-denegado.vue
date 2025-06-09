<template>
    <div class="d-flex align-center justify-center flex-column" style="height: 100vh;">
      <v-icon size="100" color="error" class="mb-4">mdi-shield-alert</v-icon>
      <h1 class="text-h3 mb-4">Acceso Denegado</h1>
      <p class="text-body-1 mb-6">No tienes permisos para acceder a esta página.</p>
      <v-btn color="primary" @click="$router.push('/login')">Volver al inicio</v-btn>
    </div>
  </template>

<script setup>
definePageMeta({
  layout: 'login',
})
</script>