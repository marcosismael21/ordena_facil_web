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
                <span class="text-h6 ma-0">Crear Proveedor</span>
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
                                    <v-text-field v-model="formData.nombre" label="Nombre del Proveedor"
                                        placeholder="Ej. Coca-Cola" :rules="[rules.required, rules.nombre]"
                                        variant="outlined" required></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.rtn" label="RTN" placeholder="Ej. 1234567891012"
                                        :rules="[rules.rtn]" variant="outlined" required maxlength="15"></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.telefono" label="Teléfono"
                                        placeholder="Ej. 24452562" :rules="[rules.telefono]" variant="outlined" required
                                        maxlength="8"></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.correo" label="Correo Electrónico"
                                        placeholder="Ej. user@example.com" :rules="[rules.correo]" variant="outlined"
                                        required></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-select v-model="formData.estado" :items="estadoOptions" label="Estado"
                                        :rules="[rules.estadoRequired]" required item-title="descripcion"
                                        variant="outlined" item-value="value"></v-select>
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


const router = useRouter();
const route = useRoute();
const search = ref('')
const datos = ref([])
const error = ref()
const loading = ref(false)
const isSnackbarVisible = ref(false)
const snackbarMessage = ref("")
const snackbarColor = ref("success")
const form = ref(null)


const formData = ref({
    nombre: '',
    rtn: '',
    correo: '',
    telefono: '',
    estado: true
})

// Primero definimos una función para limpiar el formulario
const resetForm = () => {
    formData.value = {
        nombre: '',
        rtn: '',
        correo: '',
        telefono: '',
        estado: true
    }
    form.value?.reset()
}

const rules = {
    required: (v) => !!v || "Este campo es requerido",
    nombre: (v) => /^[a-zA-Z0-9\s¿?¡!%#-]+$/.test(v) || "Solo se permiten letras, números, espacios y los caracteres ¿?¡!%#-",
    rtn: (v) => {
        if (!v) return "Este campo es requerido"
        if (!/^\d+$/.test(v)) return "Solo se permiten números"
        if (v.length < 13) return "El RTN debe tener al menos 13 dígitos"
        if (v.length > 15) return "El RTN no puede tener más de 15 dígitos"
        return true
    },
    telefono: (v) => {
        if (!v) return "Este campo es requerido"
        if (!/^\d+$/.test(v)) return "Solo se permiten números"
        if (v.length !== 8) return "El teléfono debe tener exactamente 8 dígitos"
        return true
    },
    correo: (v) => {
        if (!v) return "Este campo es requerido"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Debe ser un correo electrónico válido"
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
        title: "Proveedores",
        disabled: false,
        href: "/proveedor",
    },
    {
        title: "Crear",
        disabled: false,
    },
])

const estadoOptions = [
    { descripcion: "Activo", value: true },
    { descripcion: "Inactivo", value: false },
]

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
        const response = await $fetch(runtimeConfig.public.apiBase + "/proveedor", {
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
            snackbarMessage.value = "Proveedor creado exitosamente"
            isSnackbarVisible.value = true
            resetForm()
        } else {
            throw new Error(response.message)
        }
    } catch (e) {
        snackbarColor.value = "error"
        snackbarMessage.value = e.message || "Error al crear el proveedor"
        isSnackbarVisible.value = true
    } finally {
        loading.value = false
    }
}

const handleRegresar = () => {
    router.push("/proveedor")
}

</script>