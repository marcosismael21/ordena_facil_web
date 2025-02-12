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
                <span class="text-h6 ma-0">Detalles del Proveedor</span>
                <div style="width: 700px"></div> <!-- Espaciador para balancear -->
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
                                        placeholder="Ej. Coca-Cola" variant="outlined" readonly></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.rtn" label="RTN" placeholder="Ej. 1234567891012"
                                        variant="outlined" readonly maxlength="15"></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.telefono" label="Teléfono"
                                        placeholder="Ej. 24452562" variant="outlined" readonly
                                        maxlength="8"></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.correo" label="Correo Electrónico"
                                        placeholder="Ej. user@example.com" variant="outlined" readonly></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-select v-model="formData.estado" :items="estadoOptions" label="Estado" readonly
                                        item-title="descripcion" variant="outlined" item-value="value"></v-select>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-col>
                </v-row>
            </v-card-text>
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
        title: "Detalles",
        disabled: false,
    },
])

const estadoOptions = [
    { descripcion: "Activo", value: true },
    { descripcion: "Inactivo", value: false },
]

const getData = async () => {
    try {
        const response = await $fetch(`${runtimeConfig.public.apiBase}/proveedor/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": runtimeConfig.public.apiKey,
                "Authorization": `Bearer ${token}`,
            }
        })

        if (response.success) {
            formData.value = response.data
        } else {
            throw new Error(response.message)
        }

    } catch (e) {
        error.value = e
        snackbarColor.value = "error"
        snackbarMessage.value = e.message || "Error al cargar los datos"
        isSnackbarVisible.value = true
    }
}

onMounted(() => {
    getData()
})

const handleRegresar = () => {
    router.push("/proveedor")
}

</script>