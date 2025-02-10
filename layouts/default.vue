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
            <v-list-item v-bind="props" prepend-icon="mdi-cog" title="Parámetros"></v-list-item>
          </template>

          <v-list-item v-for="subItem in parameterMenuItems" :key="subItem.title" :prepend-icon="subItem.icon"
            :title="subItem.title" :to="subItem.to" :value="subItem.title.toLowerCase()"></v-list-item>
        </v-list-group>
      </v-list>
      <template v-slot:append>
        <div>
          <v-list-item v-for="item in parameterLogOutItems" :key="item.title" :prepend-icon="item.icon"
            :title="item.title" :to="item.to" :value="item.title.toLowerCase()"></v-list-item>
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

const theme = useTheme()

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
  { title: 'Inicio', to: '/', icon: 'mdi-home' },
  { title: 'Colaboradores', to: 'colaborador', icon: 'mdi-account-multiple' },
  { title: 'Menu', to: 'menu', icon: 'mdi-menu' }
]

const parameterMenuItems = [
  { title: 'Usuarios', to: '/parametros/usuarios', icon: 'mdi-account-cog' },
  { title: 'Roles', to: '/parametros/roles', icon: 'mdi-shield-account' },
  { title: 'Configuración', to: '/parametros/configuracion', icon: 'mdi-tune' }
]

const parameterLogOutItems = [
  {
    title: 'Cerrar Sesión',
    to: '/login',
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
</style>