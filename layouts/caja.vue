<template>
  <v-layout class="rounded rounded-md">
    <v-app-bar :elevation="1">
      <v-app-bar-title>Mi Aplicación</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn class="mx-2" icon variant="text" @click="toggleTheme">
        <v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
      <v-btn class="mx-2" icon variant="text" @click="handleLogout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <slot/>
    </v-main>
  </v-layout>
</template>

<script setup>
import {useTheme} from 'vuetify'
import {onMounted} from 'vue'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const theme = useTheme()

const handleLogout = async () => {
  try {
    await $fetch(runtimeConfig.public.apiBase + "/colaborador/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'x-api-key': runtimeConfig.public.apiKey
      }
    })
    const token = useCookie('token')
    const irdol = useCookie('rolId')
    const token2 = useCookie('colaboradorId')
    token.value = null
    token2.value = null
    irdol.value = null
    if (process.client) {
      window.localStorage.removeItem('theme')
    }
    await router.push('/login')
  } catch (error) {
    console.error("Error durante el logout:", error)
    // Aún así, limpiamos todo y redirigimos al login
    const token = useCookie('token')
    token.value = null
    if (process.client) {
      window.localStorage.removeItem('theme')
    }
    await router.push('/login')
  }
}

function toggleTheme() {
  const newTheme = theme.global.current.value.dark ? 'myCustomLightTheme' : 'dark'
  theme.global.name.value = newTheme

  // Solo acceder a localStorage en el cliente
  if (process.client) {
    window.localStorage.setItem('theme', newTheme)
  }
}

// Inicializar el tema solo en el cliente
onMounted(() => {
  if (process.client) {
    const savedTheme = window.localStorage.getItem('theme')
    if (savedTheme) {
      theme.global.name.value = savedTheme
    }
  }
})
</script>

<style scoped>
.v-btn--icon {
  transition: transform 0.2s ease-in-out;
}

.v-btn--icon:hover {
  transform: scale(1.1);
}
</style>