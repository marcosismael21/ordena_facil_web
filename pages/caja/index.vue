<template>
  <v-container fluid class="pa-0 fill-height">
    <v-row no-gutters style="height: 100vh;">
      <!-- Left Side - Menu Items -->
      <v-col cols="8" class="overflow-y-auto">
        <v-container fluid>
          <!-- Search Bar -->
          <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Buscar platillo" single-line
            variant="outlined" hide-details class="mb-4"></v-text-field>

          <!-- Grid of Menu Items -->
          <v-row>
            <v-col v-for="item in filteredItems" :key="item.id" cols="12" sm="6" md="4" lg="4">
              <v-card @click="addToOrder(item)" class="mx-auto h-100" elevation="2" hover>
                <v-img :src="item.imageUrl" height="200" cover class="align-end">
                  <v-card-title class="text-white bg-black bg-opacity-50 px-4 py-2">
                    {{ item.nombre }}
                  </v-card-title>
                </v-img>

                <v-card-text>
                  <div class="mb-2">{{ item.descripcion }}</div>
                  <div class="text-h6 font-weight-bold">
                    ${{ item.precio }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>

      <!-- Right Side - Order Summary -->
      <v-col cols="4" class="bg-grey-lighten-4">
        <v-container class="d-flex flex-column" style="height: 100%;">
          <h2 class="text-h5 mb-4">Orden Actual</h2>

          <!-- Order Items List -->
          <v-list class="flex-grow-1 overflow-y-auto">
            <v-list-item v-for="(item, index) in orderItems" :key="index" class="mb-2">
              <v-list-item-title>
                {{ item.nombre }} x{{ item.quantity }}
              </v-list-item-title>
              <v-list-item-subtitle class="d-flex justify-space-between">
                <span>${{ item.precio }}</span>
                <span>${{ item.precio * item.quantity }}</span>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <!-- Order Summary -->
          <v-card flat class="bg-transparent">
            <v-card-text>
              <div class="d-flex justify-space-between mb-2">
                <span>Subtotal:</span>
                <span>${{ subtotal }}</span>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span>Descuento:</span>
                <span>${{ discount }}</span>
              </div>
              <div class="d-flex justify-space-between text-h6">
                <span>Total:</span>
                <span>${{ total }}</span>
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn block color="success" size="large" @click="sendToKitchen">
                Mandar a Cocina
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-container>
      </v-col>
    </v-row>

    <v-snackbar v-model="isSnackbarVisible" :color="snackbarColor" timeout="3000" location="top">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
const runtimeConfig = useRuntimeConfig()
const tokenCookie = useCookie('token')
const token = tokenCookie.value

const search = ref('')
const datos = ref([])
const error = ref()
const isSnackbarVisible = ref(false)
const snackbarMessage = ref("")
const snackbarColor = ref("success")
const form = ref(null)

const orderItems = ref([])
const discount = ref(0)

const formData = ref({
  //valores de pedido
  clienteId: 1, // Por ahora hardcodeado, después se puede hacer dinámico
  colaboradorId: 2, // Por ahora hardcodeado, después se puede hacer dinámico
  tipoPedidoId: 1, // Por ahora hardcodeado para restaurante
  direccionId: null,
  descuentoPedido: 0,
  //valores de pedido detalle
  platilloIds: [],
  cantidadPedidoDetalles: [],
  precioUnitarioPedidoDetalles: [],
  contExtras: [],
  //valores de extra
  productoIds: [],
  cantidadExtras: [],
  precioUnitarioExtras: []
})

// Función para resetear el formulario
const resetForm = () => {
  formData.value = {
    clienteId: 1,
    colaboradorId: 2,
    tipoPedidoId: 1,
    direccionId: null,
    descuentoPedido: 0,
    platilloIds: [],
    cantidadPedidoDetalles: [],
    precioUnitarioPedidoDetalles: [],
    contExtras: [],
    productoIds: [],
    cantidadExtras: [],
    precioUnitarioExtras: []
  }
  orderItems.value = []
  discount.value = 0
}

// Filter items based on search
const filteredItems = computed(() => {
  if (!search.value) return datos.value
  return datos.value.filter(item =>
    item.nombre.toLowerCase().includes(search.value.toLowerCase()) ||
    item.descripcion.toLowerCase().includes(search.value.toLowerCase())
  )
})

// Calculate totals
const subtotal = computed(() => {
  return orderItems.value.reduce((acc, item) =>
    acc + (parseFloat(item.precio) * item.quantity), 0
  )
})

const total = computed(() => {
  return subtotal.value - discount.value
})

// Add item to order
const addToOrder = (item) => {
  const existingItem = orderItems.value.find(i => i.id === item.id)
  if (existingItem) {
    existingItem.quantity++
    // Encontrar el índice del item existente
    const index = formData.value.platilloIds.indexOf(item.id)
    if (index !== -1) {
      formData.value.cantidadPedidoDetalles[index]++
    }
  } else {
    orderItems.value.push({
      ...item,
      quantity: 1
    })
    // Agregar nuevo item al formData
    formData.value.platilloIds.push(item.id)
    formData.value.cantidadPedidoDetalles.push(1)
    formData.value.precioUnitarioPedidoDetalles.push(parseFloat(item.precio))
    formData.value.contExtras.push(0) // Por ahora sin extras
  }
}

const handleCreate = async () => {
  if (orderItems.value.length === 0) {
    snackbarColor.value = "error"
    snackbarMessage.value = "Debe agregar al menos un platillo a la orden"
    isSnackbarVisible.value = true
    return
  }

  try {
    // Actualizar el descuento antes de enviar
    formData.value.descuentoPedido = discount.value

    const response = await $fetch(runtimeConfig.public.apiBase + "/pedido", {
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
      snackbarMessage.value = "Pedido creado exitosamente"
      isSnackbarVisible.value = true
      resetForm() // Limpiar el formulario después de crear el pedido
    } else {
      throw new Error(response.message)
    }
  } catch (e) {
    snackbarColor.value = "error"
    snackbarMessage.value = e.message || "Error al crear el pedido"
    isSnackbarVisible.value = true
  }
}

const sendToKitchen = () => {
  handleCreate()
}

const getData = async () => {
  try {
    const response = await $fetch(runtimeConfig.public.apiBase + "/platillo", {
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
</script>

<style scoped>
.v-container {
  max-width: 100%;
}
</style>