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
      <v-card-title class="d-flex align-center justify-space-between py-2">
        <v-btn :loading="loading" prepend-icon="mdi-arrow-collapse-left" variant="tonal" @click="handleRegresar"
          class="ma-0">
          Regresar
        </v-btn>
        <span class="text-h6 ma-0">Detalles del Platillo</span>
        <div style="width: 750px"></div>
      </v-card-title>
      <v-card-text class="pt-6">
        <v-row class="d-flex align-center">
          <v-col cols="12">
            <v-form ref="form">
              <v-row>
                <v-col cols="4">
                  <div class="text-center mb-4">
                    <h3 class="text-h6">Detalles del Platillo</h3>
                  </div>
                  <v-row class="px-2">
                    <v-col cols="12">
                      <v-text-field v-model="formData.nombre" label="Nombre del Platillo"
                        placeholder="Ej. Hamburgesa Doble"  variant="outlined"
                        readonly>
                      </v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field v-model="formData.descripcion" label="Descripcion"
                        placeholder="Ej. Combo de hamburgesa doble" 
                        variant="outlined" readonly>
                      </v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field v-model="formData.precio" label="Precio" placeholder="Ej. 150"
                       variant="outlined" readonly>
                      </v-text-field>
                    </v-col>
                    <v-col cols="7">
                      <v-autocomplete v-model="formData.tipoplatilloId" :items="tipoPlatillos" label="Tipo de Platillo"
                        placeholder="Platillo" readonly
                        item-title="descripcion" variant="outlined" item-value="id">
                      </v-autocomplete>
                    </v-col>
                    <v-col cols="5">
                      <v-select v-model="formData.estado" :items="estadoOptions" label="Estado"
                       readonly item-title="descripcion" variant="outlined"
                        item-value="value">
                      </v-select>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="4">
                  <div class="text-center mb-4">
                    <h3 class="text-h6">Productos y Cantidades</h3>
                  </div>
                  <div class="px-2">
                    <div v-for="(item, index) in productosSeleccionados" :key="index" class="mb-4">
                      <v-row align="center" no-gutters>
                        <v-col cols="9">
                          <v-autocomplete v-model="item.productoId" :items="productosFiltrados(index)" label="Producto"
                            item-title="descripcion" item-value="id" variant="outlined" readonly
                           >
                          </v-autocomplete>
                        </v-col>
                        <v-col cols="3">
                          <v-text-field readonly v-model="item.cantidad" label="Cantidad" type="number" variant="outlined"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </div>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="text-center mb-4">
                    <h3 class="text-h6">Imagen del Platillo</h3>
                  </div>
                  <div class="px-2">

                    <div class="image-container">
                      <v-img v-if="imagePreview || formData.imageUrl" :src="imagePreview || formData.imageUrl" cover
                        class="bg-grey-lighten-2" :class="{ 'image-expanded': isImageExpanded }"
                        @click="isImageExpanded = !isImageExpanded" style="cursor: pointer" max-height="300">
                        <template v-slot:placeholder>
                          <v-row class="fill-height ma-0" align="center" justify="center">
                            <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                          </v-row>
                        </template>
                      </v-img>
                      <v-img v-else height="200" class="bg-grey-lighten-2" cover>
                        <v-row class="fill-height ma-0" align="center" justify="center">
                          <v-icon size="80" color="grey-lighten-1">mdi-image</v-icon>
                        </v-row>
                      </v-img>
                    </div>
                  </div>
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
const search = ref('')
const datos = ref([])
const error = ref()
const loading = ref(false)
const isSnackbarVisible = ref(false)
const snackbarMessage = ref("")
const snackbarColor = ref("success")
const form = ref(null)

//variables de los v-select
const productos = ref([])
const tipoPlatillos = ref([])

//para la preview de imagen
const imagePreview = ref(null)

//para los productos y cantidades
const productosSeleccionados = ref([
  { productoId: null, cantidad: '' }
])

const formData = ref({
  image: null,
  nombre: '',
  descripcion: '',
  tipoplatilloId: '',
  precio: '',
  estado: true
})

const addProducto = () => {
  productosSeleccionados.value.push({ productoId: null, cantidad: '' })
}


//filtrar productos ya seleccionados
const productosFiltrados = (currentIndex) => {
  const productosIds = productosSeleccionados.value
    .map((item, index) => index !== currentIndex ? item.productoId : null)
    .filter(id => id !== null)

  return productos.value.filter(p => !productosIds.includes(p.id))
}

const itemsBread = ref([
  {
    title: "Inicio",
    disabled: false,
  },
  {
    title: "Menú de Platillos",
    disabled: false,
    href: "/menu",
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

const getDataSelect = async () => {
  try {

    const getProducto = await $fetch(runtimeConfig.public.apiBase + "/producto", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    })

    const getTipoPlatillo = await $fetch(runtimeConfig.public.apiBase + "/tipoPlatillo", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    })

    productos.value = getProducto.data
    tipoPlatillos.value = getTipoPlatillo.data
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

await getDataSelect()

const getData = async () => {
  try {
    const response = await $fetch(`${runtimeConfig.public.apiBase}/platillo/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    })

    if (response.success && response.data.length > 0) {
      const platillo = response.data[0]

      // Actualizar formData con los datos básicos
      formData.value = {
        nombre: platillo.nombre,
        descripcion: platillo.descripcion,
        tipoplatilloId: platillo.tipoplatilloId,
        precio: platillo.precio,
        estado: platillo.estado === 1,
        imageUrl: platillo.imageUrl
      }

      // Actualizar preview de imagen si existe
      if (platillo.imageUrl) {
        imagePreview.value = platillo.imageUrl
      }

      // Procesar los detalles del platillo
      const detalleIds = platillo.detalleId.split(',').map(Number)
      const cantidades = platillo.cantidad.split(',').map(Number)
      const descripciones = platillo.productoDescripcion.split(', ')

      // Recrear el array de productos seleccionados
      productosSeleccionados.value = detalleIds.map((_, index) => {
        const producto = productos.value.find(p => p.descripcion === descripciones[index]);
        return {
          productoId: producto ? producto.id : null,
          cantidad: cantidades[index]
        };
      });

    } else {
      throw new Error('No se encontró el platillo')
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
  router.push("/menu")
}

</script>

<style scoped>
.image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 4px;
}

.image-expanded {
  position: relative;
  z-index: 1000;
  transform-origin: center;
  transition: all 0.3s ease;
}

.image-expanded:hover {
  transform: scale(1.05);
}

.v-col {
  display: flex;
  flex-direction: column;
}

.px-2 {
  height: 100%;
}
</style>