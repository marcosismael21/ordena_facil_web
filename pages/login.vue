<template>
  <div class="d-flex align-center justify-center" style="height: 100vh; background-color: #f5f5f5;">
    <v-card class="auth-card mx-auto" max-width="460" elevation="4">
      <!-- Logo y Título -->
      <v-card-item class="justify-center text-center pb-2">
        <v-card-title class="text-h4 font-weight-bold">
          ORDENA FÁCIL
        </v-card-title>
      </v-card-item>

      <v-card-text class="text-center pb-2">
        <h4 class="text-h5 mb-1">
          ¡Bienvenido! 👋
        </h4>
        <p class="text-body-2 text-medium-emphasis">
          Por favor, inicia sesión para comenzar
        </p>
      </v-card-text>

      <v-card-text>
        <v-form @submit.prevent="handleLogin" ref="form">
          <v-row>
            <!-- Usuario -->
            <v-col cols="12">
              <v-text-field v-model="usuario" label="Nombre de Usuario" placeholder="juanDiaz"
                prepend-inner-icon="mdi-account" variant="outlined" :rules="[rules.required]"
                :error-messages="errorMessage" :disabled="isLoading"></v-text-field>
            </v-col>

            <!-- Contraseña -->
            <v-col cols="12">
              <v-text-field v-model="clave" label="Contraseña" placeholder="············"
                prepend-inner-icon="mdi-lock-outline" :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
                :type="isPasswordVisible ? 'text' : 'password'" variant="outlined"
                @click:append-inner="isPasswordVisible = !isPasswordVisible" :rules="[rules.required]"
                :error-messages="errorMessage" :disabled="isLoading"></v-text-field>

              <div class="d-flex align-center justify-space-between flex-wrap mb-6">
                <v-btn variant="text" color="primary" class="px-0" @click="forgotPassword" :disabled="isLoading">
                  ¿Olvidaste tu contraseña?
                </v-btn>
              </div>

              <v-btn block color="primary" size="large" type="submit" :loading="isLoading" :disabled="!formIsValid">
                Iniciar Sesión
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="isSnackbarVisible" :color="snackbarColor" timeout="3000" location="top">
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'login',
})

const runtimeConfig = useRuntimeConfig()
const form = ref(null)
const router = useRouter()
const route = useRoute()

const usuario = ref("")
const clave = ref("")
const isPasswordVisible = ref(false)
const isLoading = ref(false)
const errorMessage = ref("")
const isSnackbarVisible = ref(false)
const snackbarMessage = ref("")
const snackbarColor = ref("success")
const formIsValid = ref(false)

const rules = {
  required: v => !!v || 'Este campo es requerido',
}

watch([usuario, clave], async () => {
  formIsValid.value = !!usuario.value && !!clave.value
})

const handleLogin = async () => {
  try {
    const { valid } = await form.value?.validate()
    if (!valid) return
    isLoading.value = true
    errorMessage.value = "";

    await new Promise(resolve => setTimeout(resolve, 1000))

    const response = await $fetch(runtimeConfig.public.apiBase + "/colaborador/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'x-api-key': runtimeConfig.public.apiKey
      },
      body: {
        usuario: usuario.value,
        clave: clave.value,
      },
    })

    if (response.ok) {
      // Guardar token
      const token = useCookie('token')
      token.value = response.token

      const colaboradorId = useCookie('colaboradorId')
      colaboradorId.value = response.userData.id

      // Mostrar mensaje de éxito
      snackbarColor.value = "success"
      snackbarMessage.value = "¡Inicio de sesión exitoso!"
      isSnackbarVisible.value = true

      // Redireccionar
      await router.replace(route.query.to ?? "/caja")
    } else {
      snackbarColor.value = "error"
      snackbarMessage.value = response.mensage || "Error al iniciar sesión"
      isSnackbarVisible.value = true
    }
  } catch (error) {
    console.error("Login error:", error)
    snackbarColor.value = "error"
    snackbarMessage.value = "Error al iniciar sesión. Por favor, verifica tus credenciales."
    isSnackbarVisible.value = true
    errorMessage.value = "Credenciales inválidas"
  } finally {
    isLoading.value = false;
  }
}

const forgotPassword = () => {
  // Implementar navegación a recuperar contraseña
}

</script>

<style scoped>
.auth-card {
  border-radius: 1rem;
}
</style>