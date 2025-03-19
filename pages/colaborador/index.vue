<template>
  <v-container>
    <div>
      <v-breadcrumbs :items="itemsBread">
        <template v-slot:divider>
          <v-icon icon="mdi-chevron-right"></v-icon>
        </template>
      </v-breadcrumbs>
    </div>

    <v-card>
      <v-card-title>
        Colaboradores
      </v-card-title>
      <v-card-text>
        <v-row class="d-flex align-center">
          <v-col cols="12" md="6" class="d-flex justify-start">
            <v-btn prepend-icon="mdi-plus" variant="tonal" color="primary" @click="crearItem">
              Agregar Colaborador
            </v-btn>
          </v-col>
          <v-col cols="12" md="6" class="d-flex justify-end">
            <v-text-field v-model="search" placeholder="Buscar ..." append-inner-icon="mdi-magnify" single-line
              hide-details density="compact" variant="outlined" style="max-width: 300px" />
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-spacer></v-spacer>

        <v-tabs v-model="tabs" align-tabs="center" class="justify-center" color="deep-purple-accent-4">
          <v-tab :key="1">Colaboradores Habilitados</v-tab>
          <v-tab :key="2">Colaboradores Deshabilitados</v-tab>
        </v-tabs>

        <v-tabs-window v-model="tabs">
          <v-tabs-window-item :key=1>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-data-table :headers="hearders" :items="datos" :search="search">
                    <template #[`item.estado`]="{ item }">
                      <v-chip :color="resolveStatusVariant(item.estado).color" class="font-weight-medium" size="small">
                        {{ resolveStatusVariant(item.estado).text }}
                      </v-chip>
                    </template>
                    <template #[`item.actions`]="{ item }">
                      <div class="d-flex gap-1">
                        <v-btn icon="mdi-pencil" size="small" variant="text" @click="editItem(item.id)"></v-btn>
                        <v-btn icon="mdi-eye" size="small" variant="text" @click="showItem(item.id)"></v-btn>
                        <v-btn icon="mdi-delete" size="small" variant="text" color="error"
                          @click="deleteItem(item.id)"></v-btn>
                      </div>
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
            </v-container>
          </v-tabs-window-item>
          <v-tabs-window-item :key=2>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-data-table :headers="hearders" :items="datosFalse" :search="search">
                    <template #[`item.estado`]="{ item }">
                      <v-chip :color="resolveStatusVariant(item.estado).color" class="font-weight-medium" size="small">
                        {{ resolveStatusVariant(item.estado).text }}
                      </v-chip>
                    </template>
                    <template #[`item.actions`]="{ item }">
                      <div class="d-flex gap-1">
                        <v-btn icon="mdi-pencil" size="small" variant="text" @click="editItem(item.id)"></v-btn>
                        <v-btn icon="mdi-eye" size="small" variant="text" @click="showItem(item.id)"></v-btn>
                        <v-btn icon="mdi-delete" size="small" variant="text" color="error"
                          @click="deleteItem(item.id)"></v-btn>
                      </div>
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
            </v-container>
          </v-tabs-window-item>
        </v-tabs-window>

      </v-card-text>
    </v-card>

    <v-snackbar v-model="isSnackbarVisible" :color="snackbarColor" timeout="3000" location="top">
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- dialog de confirmar -->
    <v-dialog v-model="isConfirmDialogVisible" persistent width="500">
      <v-card title="Confirmar eliminación">
        <v-card-text>
          ¿Está seguro que desea eliminar este colaborador? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" variant="tonal" @click="isConfirmDialogVisible = false">
            Cancelar
          </v-btn> <v-btn color="error" @click="handleDelete">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de carga -->
    <v-dialog v-model="dialogEliminar" persistent width="300">
      <v-card color="primary" width="300">
        <v-card-text class="pt-3">
          Eliminando colaborador...
          <v-progress-linear indeterminate bg-color="rgba(var(--v-theme-surface), 0.1)" :height="8" class="mb-0 mt-4" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>


<script setup>

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  requiredRoles: [2]
})

const runtimeConfig = useRuntimeConfig()
const tokenCookie = useCookie('token')
const token = tokenCookie.value
const tabs = ref(0)

const search = ref('')
const datos = ref([])
const datosFalse = ref([])
const error = ref()
const isSnackbarVisible = ref(false)
const snackbarMessage = ref("")
const snackbarColor = ref("success")
const form = ref(null)
const router = useRouter();
const route = useRoute();

//variables para el dialog de eliminar
const isConfirmDialogVisible = ref(false)
const deleteItemId = ref(null)
const dialogEliminar = ref(false)

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
])

const hearders = [
  {
    title: "N°",
    key: "nro",
    sortable: true,
  },
  {
    title: "Nombres",
    key: "nombres",
  },
  {
    title: "Rol",
    key: "rol",
  },
  {
    title: "Teléfono",
    key: "telefono",
  },
  {
    title: "Estado",
    key: "estado",
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
  },
]

const resolveStatusVariant = (estado) => {
  if (estado === 1) return { color: 'success', text: 'Activo' }
  return { color: 'error', text: 'Inactivo' }
}

const getData = async () => {
  try {
    const response = await $fetch(runtimeConfig.public.apiBase + "/colaborador/estado/1", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    })

    const responseFalse = await $fetch(runtimeConfig.public.apiBase + "/colaborador/estado/0", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    })

    if (response.success) {
      datos.value = response.data.map((item, index) => ({
        ...item,
        nro: index + 1
      }))

      datosFalse.value = responseFalse.data.map((item, index) => ({
        ...item,
        nro: index + 1
      }))

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

const handleDelete = async () => {
  isConfirmDialogVisible.value = false
  dialogEliminar.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const response = await $fetch(`${runtimeConfig.public.apiBase}/colaborador/${deleteItemId.value}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    })

    if (response.success) {
      await new Promise(resolve => setTimeout(resolve, 500))
      dialogEliminar.value = false
      snackbarColor.value = "success"
      snackbarMessage.value = "Colaborador eliminado exitosamente"
      isSnackbarVisible.value = true

      await getData()
      closeDialog()
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    snackbarColor.value = "error"
    snackbarMessage.value = error.data.message || "Error al eliminar el colaborador"
    isSnackbarVisible.value = true
  } finally {
    closeDialog()
  }
}

const crearItem = () => {
  router.push("/colaborador/crear")
}

const editItem = (id) => {
  router.push(`/colaborador/${id}`)
}

const showItem = (id) => {
  router.push(`/colaborador/show/${id}`)
}

const deleteItem = async (id) => {
  deleteItemId.value = id
  isConfirmDialogVisible.value = true
}

const closeDialog = () => {
  isConfirmDialogVisible.value = false
  dialogEliminar.value = false
  deleteItemId.value = null
}
</script>