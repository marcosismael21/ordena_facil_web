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
        <span class="text-h6 ma-0">Editar Producto</span>
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
                  <v-text-field v-model="formData.descripcion" label="Nombre del Producto"
                    placeholder="Ej. Coca-Cola 500ml" :rules="[rules.required, rules.descripcion]" variant="outlined"
                    required>
                  </v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="formData.codigo" label="Código" placeholder="Ej. C010"
                    :rules="[rules.required, rules.codigo]" variant="outlined" required>
                  </v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-autocomplete v-model="formData.proveedorId" :items="proveedores" label="Proveedor"
                    :rules="[rules.estadoRequired]" required item-title="nombre" variant="outlined" item-value="id">
                  </v-autocomplete>
                </v-col>
                <v-col cols="6">
                  <v-autocomplete v-model="formData.tipoMedidaId" :items="tiposMedidas" label="Tipo de Medida"
                    :rules="[rules.estadoRequired]" required item-title="descripcion" variant="outlined"
                    item-value="id">
                  </v-autocomplete>
                </v-col>
                <v-col cols="6">
                  <v-autocomplete v-model="formData.categoriaId" :items="categorias" label="Categoría"
                    :rules="[rules.estadoRequired]" required item-title="descripcion" variant="outlined"
                    item-value="id">
                  </v-autocomplete>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="formData.cantidad" label="Cantidad" placeholder="Ej. 10"
                    :rules="[rules.required, rules.cantidad]" variant="outlined" required>
                  </v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select v-model="formData.estado" :items="estadoOptions" label="Estado"
                    :rules="[rules.estadoRequired]" required item-title="descripcion" variant="outlined"
                    item-value="value">
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
        <v-btn color="success" variant="elevated" @click="handleUpdate" :loading="loading" :disabled="loading">
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


//variables de los v-select
const proveedores = ref([])
const tiposMedidas = ref([])
const categorias = ref([])

const formData = ref({
  descripcion: '',
  proveedorId: '',
  tipoMedidaId: '',
  categoriaId: '',
  cantidad: '',
  codigo: '',
  estado: true
})

const rules = {
    required: (v) => !!v || "Este campo es requerido",
    descripcion: (v) => {
        if (!v) return "Este campo es requerido"
        if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s]+$/.test(v)) return "Solo se permiten letras, números y espacios"
        return true
    },
    cantidad: (v) => {
        if (!v) return "Este campo es requerido"
        if (!/^\d*\.?\d+$/.test(v)) return "Solo se permiten números enteros o decimales"
        return true
    },
    codigo: (v) => {
        if (!v) return "Este campo es requerido"
        if (!/^[a-zA-Z0-92]{1,5}$/.test(v)) return "Solo se permiten letras y números, máximo 5 caracteres"
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
        title: "Inventario de Productos",
        disabled: false,
        href: "/inventario",
    },
    {
        title: "Editar",
        disabled: false,
    },
])

const estadoOptions = [
  { descripcion: "Activo", value: true },
  { descripcion: "Inactivo", value: false },
]

const getDataSelect = async () => {
    try {

        const getProveedor = await $fetch(runtimeConfig.public.apiBase + "/proveedor", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": runtimeConfig.public.apiKey,
                "Authorization": `Bearer ${token}`,
            }
        })

        const getTipoMedida = await $fetch(runtimeConfig.public.apiBase + "/tipoMedida", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": runtimeConfig.public.apiKey,
                "Authorization": `Bearer ${token}`,
            }
        })

        const getCategoria = await $fetch(runtimeConfig.public.apiBase + "/categoria", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": runtimeConfig.public.apiKey,
                "Authorization": `Bearer ${token}`,
            }
        })

        proveedores.value = getProveedor.data
        tiposMedidas.value = getTipoMedida.data
        categorias.value = getCategoria.data
    } catch (error) {
        console.error('Error fetching data:', error)
    }
}

const filtrarElementosActivos = (array) => array.filter(element => element.estado !== false)

const dataRefs = {
    proveedores,
    tiposMedidas,
    categorias
}

Object.entries(dataRefs).forEach(([key, ref]) => {
    watch(ref, (nuevos, viejos) => {
        if (viejos.length === 0) {
            ref.value = filtrarElementosActivos(nuevos)
        }
    })
})

await getDataSelect()

const getData = async () => {
  try {
    const response = await $fetch(`${runtimeConfig.public.apiBase}/producto/${id}`, {
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

const handleUpdate = async () => {
  const { valid } = await form.value?.validate()

  if (!valid) {
    snackbarColor.value = "error"
    snackbarMessage.value = "Por favor, complete correctamente todos los campos"
    isSnackbarVisible.value = true
    return
  }

  loading.value = true

  try {
    const response = await $fetch(`${runtimeConfig.public.apiBase}/producto/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      },
      body: formData.value
    })

    if (response.success) {
      snackbarColor.value = "success"
      snackbarMessage.value = "Producto actualizado exitosamente"
      isSnackbarVisible.value = true
      handleRegresar()
    } else {
      throw new Error(response.message)
    }
  } catch (e) {
    snackbarColor.value = "error"
    snackbarMessage.value = e.message || "Error al actualizar el producto"
    isSnackbarVisible.value = true
  } finally {
    loading.value = false
  }
}

const handleRegresar = () => {
  router.push("/inventario")
}

</script>