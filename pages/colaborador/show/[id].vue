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
                <span class="text-h6 ma-0">Detalles del Colaborador</span>
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
                                        placeholder="Ej. Juan Pérez" variant="outlined" readonly>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.dni" label="DNI" placeholder="Ej. 12345678"
                                        variant="outlined" readonly>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.telefono" label="Teléfono"
                                        placeholder="Ej. 99999999" variant="outlined" readonly>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.correo" label="Correo"
                                        placeholder="Ej. ejemplo@correo.com" variant="outlined" readonly>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-autocomplete v-model="formData.rolId" :items="roles" label="Rol" readonly
                                        item-title="descripcion" variant="outlined" item-value="id">
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.usuario" label="Usuario" placeholder="Ej. usuario1"
                                        variant="outlined" readonly>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-select v-model="formData.estado" :items="estadoOptions" label="Estado" readonly
                                        item-title="descripcion" variant="outlined" item-value="value">
                                    </v-select>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.createdAt" label="Fecha de Creación"
                                        variant="outlined" readonly>
                                    </v-text-field>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" @click="handleRegresar">Cancelar</v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup>
const runtimeConfig = useRuntimeConfig()
const tokenCookie = useCookie('token')
const token = tokenCookie.value

const router = useRouter()
const route = useRoute()
const id = route.params.id
const error = ref()
const loading = ref(false)
const isSnackbarVisible = ref(false)
const snackbarMessage = ref("")
const snackbarColor = ref("success")
const form = ref(null)

// Variables de los v-select
const roles = ref([])

const formData = ref({
    nombres: '',
    rolId: '',
    correo: '',
    telefono: '',
    dni: '',
    usuario: '',
    estado: 1,
    createdAt: ''
})

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
        title: "Detalles",
        disabled: false,
    },
])

const estadoOptions = [
    { descripcion: "Activo", value: true },
    { descripcion: "Inactivo", value: false },
]

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

const getData = async () => {
    try {
        const response = await $fetch(`${runtimeConfig.public.apiBase}/colaborador/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": runtimeConfig.public.apiKey,
                "Authorization": `Bearer ${token}`,
            }
        })

        if (response.success) {
            const colaborador = response.data;
            // Formatear la fecha de creación si existe
            if (colaborador.createdAt) {
                colaborador.createdAt = formatDate(colaborador.createdAt);
            }
            formData.value = colaborador;
        } else {
            throw new Error(response.message)
        }

    } catch (e) {
        error.value = e
        snackbarColor.value = "error"
        snackbarMessage.value = e.message || "Error al cargar los datos del colaborador"
        isSnackbarVisible.value = true
    }
}

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
            roles.value = response.data
        } else {
            throw new Error(response.message || "Error al obtener los roles")
        }
    } catch (error) {
        console.error('Error fetching roles:', error)
    }
}

onMounted(() => {
    getRoles()
    getData()
})

const handleRegresar = () => {
    router.push("/colaborador")
}
</script>