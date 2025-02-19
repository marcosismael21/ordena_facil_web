<template>
  <v-layout class="rounded rounded-md">
    <v-navigation-drawer expand-on-hover rail>
      <v-list>
        <v-list-item prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg" title="Sandra Adams"
          subtitle="sandra_a88@gmail.com"></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <!-- Menús normales -->
        <v-list-item v-for="item in regularMenuItems" :key="item.title" :prepend-icon="item.icon" :title="item.title"
          :to="item.to" :value="item.title.toLowerCase()"></v-list-item>

        <!-- Grupo de Parámetros -->
        <v-list-group value="Parametros">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-cog" title="Parámetros" class="parameter-group"></v-list-item>
          </template>

          <v-list-item v-for="subItem in parameterMenuItems" :key="subItem.title" :prepend-icon="subItem.icon"
            :title="subItem.title" :to="subItem.to" :value="subItem.title.toLowerCase()" class="parameter-item">
            <template v-slot:prepend>
              <v-icon size="20" class="me-2">{{ subItem.icon }}</v-icon>
            </template>
            <template v-slot:title>
              <span class="text-truncate" style="max-width: 180px">{{ subItem.title }}</span>
            </template>
          </v-list-item>
        </v-list-group>
      </v-list>
      <template v-slot:append>
        <div>
          <v-list-item v-for="item in parameterLogOutItems" :key="item.title" :prepend-icon="item.icon"
            :title="item.title" :value="item.title.toLowerCase()" @click="handleLogout"></v-list-item>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar :elevation="1">
      <v-app-bar-title>Mi Aplicación</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn class="mx-2" icon variant="text" @click="toggleTheme">
        <v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main style="min-height: 300px;">
      <v-container>
        <slot />
      </v-container>
    </v-main>

    <v-footer app class="bg-grey-lighten-1">
      <span>MR SOLUTION&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-layout>
</template>

<script setup>
import { useTheme } from 'vuetify'
import { onMounted } from 'vue'
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
    token.value = null
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

const regularMenuItems = [
  { title: 'Caja', to: '/caja', icon: 'mdi-cash-register' },
  { title: 'Inventario', to: '/inventario', icon: 'mdi-silverware' },
  { title: 'Menú', to: '/menu', icon: 'mdi-food' },
  { title: 'Colaboradores', to: '/colaborador', icon: 'mdi-account-multiple' },
]

const parameterMenuItems = [
  { title: 'Tipos de Platillos', to: '/tipoPlatillo', icon: 'mdi-food-fork-drink' },
  { title: 'Proveedores', to: '/proveedor', icon: 'mdi-truck-delivery' },
  { title: 'Categorías de Prouductos', to: '/categoria', icon: 'mdi-shape-outline' },
  { title: 'Tipos de Medidas', to: '/tipoMedida', icon: 'mdi-scale' },
]

const parameterLogOutItems = [
  {
    title: 'Cerrar Sesión',
    icon: 'mdi-logout',
  },
]

const links = [
  'Inicio',
  'Sobre Nosotros',
  'Equipo',
  'Servicios',
  'Contacto'
]
</script>

<style scoped>
.v-btn--icon {
  transition: transform 0.2s ease-in-out;
}

.v-btn--icon:hover {
  transform: scale(1.1);
}

:deep(.parameter-group) {
  margin-bottom: 4px;
}

:deep(.parameter-item) {
  padding-left: 12px !important;
  min-height: 40px !important;
}

:deep(.v-list-group__items .v-list-item) {
  padding-left: 16px;
}

:deep(.v-list-group--prepend) {
  padding-inline-start: 0px !important;
}

:deep(.v-list-item--active) {
  background-color: rgb(var(--v-theme-primary), 0.1) !important;
}

:deep(.v-list-item--active::before) {
  opacity: 0 !important;
}

:deep(.v-list-group__items .v-icon) {
  opacity: 0.8;
}
</style>