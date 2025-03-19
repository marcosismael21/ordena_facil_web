<template>
    <v-container>
        <v-snackbar v-model="isSnackbarVisible" :color="snackbarColor" timeout="3000" location="top">
            {{ snackbarMessage }}
        </v-snackbar>
        <div>
            <v-breadcrumbs :items="itemsBread">
                <template v-slot:divider>
                    <v-icon icon="mdi-chevron-right"></v-icon>
                </template>
            </v-breadcrumbs>
        </div>
        <v-card>
            <v-card-title class="d-flex align-center justify-space-between py-4">
                <v-btn :loading="loading" prepend-icon="mdi-arrow-collapse-left" variant="tonal" @click="handleRegresar"
                    class="ma-0">
                    Regresar
                </v-btn>
                <span class="text-h6 ma-0">Crear Colaborador</span>
                <div style="width: 750px"></div> <!-- Espaciador para balancear -->
            </v-card-title>
            <v-card-text class="pt-6">
                <v-row class="d-flex align-center">
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-form ref="form">
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.nombres" label="Nombres"
                                        placeholder="Ej. Juan Pérez" :rules="[rules.required, rules.nombres]"
                                        variant="outlined" required>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.dni" label="DNI" placeholder="Ej. 12345678"
                                        :rules="[rules.required, rules.dni]" variant="outlined" required>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.telefono" label="Teléfono"
                                        placeholder="Ej. 99999999" :rules="[rules.required, rules.telefono]"
                                        variant="outlined" required>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.correo" label="Correo"
                                        placeholder="Ej. ejemplo@correo.com" :rules="[rules.required, rules.correo]"
                                        variant="outlined" required>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-autocomplete v-model="formData.rolId" :items="roles" label="Rol"
                                        :rules="[rules.estadoRequired]" required item-title="descripcion"
                                        variant="outlined" item-value="id">
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.usuario" label="Usuario" placeholder="Ej. usuario1"
                                        :rules="[rules.required, rules.usuario]" variant="outlined" required>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.clave" label="Contraseña"
                                        placeholder="Ingrese contraseña" :rules="[rules.required, rules.clave]"
                                        variant="outlined" required
                                        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                        :type="showPassword ? 'text' : 'password'"
                                        @click:append-inner="showPassword = !showPassword">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-select v-model="formData.estado" :items="estadoOptions" label="Estado"
                                        :rules="[rules.estadoRequired]" required item-title="descripcion"
                                        variant="outlined" item-value="value">
                                    </v-select>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" @click="handleRegresar">Cancelar</v-btn>
                <v-btn color="success" variant="elevated" @click="handleCreate" :loading="loading" :disabled="loading">
                    Guardar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup>
const runtimeConfig = useRuntimeConfig()
const tokenCookie = useCookie('token')
const token = tokenCookie.value

const router = useRouter()
const loading = ref(false)
const isSnackbarVisible = ref(false)
const snackbarMessage = ref("")
const snackbarColor = ref("success")
const form = ref(null)
const showPassword = ref(false)

// Variables de los v-select
const roles = ref([])

const formData = ref({
    nombres: '',
    rolId: '',
    correo: '',
    telefono: '',
    dni: '',
    usuario: '',
    clave: '',
    estado: 1
})

// Función para limpiar el formulario
const resetForm = () => {
    formData.value = {
        nombres: '',
        rolId: '',
        correo: '',
        telefono: '',
        dni: '',
        usuario: '',
        clave: '',
        estado: 1
    }
    form.value?.reset()
}

const rules = {
    required: (v) => !!v || "Este campo es requerido",
    nombres: (v) => {
        if (!v) return "Este campo es requerido"
        if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(v)) return "Solo se permiten letras y espacios"
        return true
    },
    dni: (v) => {
        if (!v) return "Este campo es requerido"
        if (!/^\d+$/.test(v)) return "Solo se permiten números"
        if (v.length < 13) return "El RTN debe tener al menos 13 dígitos"
        if (v.length > 15) return "El RTN no puede tener más de 15 dígitos"
        return true
    },
    telefono: (v) => {
        if (!v) return "Este campo es requerido"
        if (!/^\d{8,9}$/.test(v)) return "El teléfono debe tener entre 8 y 9 dígitos"
        return true
    },
    correo: (v) => {
        if (!v) return "Este campo es requerido"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Correo electrónico inválido"
        return true
    },
    usuario: (v) => {
        if (!v) return "Este campo es requerido"
        if (!/^[a-zA-Z0-9]{3,15}$/.test(v)) return "El usuario debe tener entre 3 y 15 caracteres alfanuméricos"
        return true
    },
    clave: (v) => {
        if (!v) return "Este campo es requerido"
        if (v.length < 5) return "La contraseña debe tener al menos 5 caracteres"
        return true
    },
    estadoRequired: (v) => v !== undefined || "Este campo es requerido",
}

const itemsBread = ref([
    {
        title: "Inicio",
        disabled: false,
    },
    {
        title: "Colaboradores",
        disabled: false,
        href: "/colaborador",
    },
    {
        title: "Crear",
        disabled: false,
    },
])

const estadoOptions = [
    { descripcion: "Activo", value: 1 },
    { descripcion: "Inactivo", value: 0 },
]

const getRoles = async () => {
    try {
        const response = await $fetch(runtimeConfig.public.apiBase + "/rol", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": runtimeConfig.public.apiKey,
                "Authorization": `Bearer ${token}`,
            }
        })

        if (response.success) {
            roles.value = response.data.filter(rol => rol.estado === true)
        } else {
            throw new Error(response.message || "Error al obtener los roles")
        }
    } catch (error) {
        console.error('Error fetching roles:', error)
        snackbarColor.value = "error"
        snackbarMessage.value = "Error al cargar los roles"
        isSnackbarVisible.value = true
    }
}

await getRoles()

const handleCreate = async () => {
    const { valid } = await form.value?.validate()

    if (!valid) {
        snackbarColor.value = "error"
        snackbarMessage.value = "Por favor, complete correctamente todos los campos"
        isSnackbarVisible.value = true
        return
    }

    loading.value = true

    try {
        const response = await $fetch(runtimeConfig.public.apiBase + "/colaborador", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": runtimeConfig.public.apiKey,
                "Authorization": `Bearer ${token}`,
            },
            body: formData.value
        })

        if (response.success) {
            snackbarColor.value = "success"
            snackbarMessage.value = "Colaborador creado exitosamente"
            isSnackbarVisible.value = true
            resetForm()
        } else {
            throw new Error(response.message)
        }
    } catch (e) {
        snackbarColor.value = "error"
        snackbarMessage.value = e.message || "Error al crear el colaborador"
        isSnackbarVisible.value = true
    } finally {
        loading.value = false
    }
}

const handleRegresar = () => {
    router.push("/colaborador")
}
</script>