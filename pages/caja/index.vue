<template>
  <v-container fluid class="pa-2" style="height: calc(100vh - 48px)">
    <v-row no-gutters style="height: 100%;">
      <!-- Sección 1: Pedidos Pendientes -->
      <v-col cols="2" class="border-r px-2">
        <div class="d-flex flex-column h-100">
          <div class="px-4 pt-4">
            <h2 class="text-h6 mb-2">Pedidos Pendientes</h2>
            <v-text-field v-model="searchPending" prepend-inner-icon="mdi-magnify" label="Buscar pedido" single-line
              variant="outlined" hide-details density="compact" class="mb-2">
            </v-text-field>
          </div>

          <div class="flex-grow-1 overflow-y-auto px-2">
            <v-card v-for="pedido in filteredPendingOrders" :key="pedido.id" class="mb-2" elevation="2" hover
              @click="selectPendingOrder(pedido)" density="compact">
              <v-card-item>
                <v-card-title class="text-subtitle-2">#{{ pedido.numeroOrden }}</v-card-title>
                <v-card-subtitle class="text-caption">Cliente: {{ pedido.nombreCliente }}</v-card-subtitle>
                <v-card-subtitle class="text-caption">DNI: {{ pedido.dni }}</v-card-subtitle>
                <div class="text-caption d-flex justify-space-between">
                  <span>Total:</span>
                  <span>${{ pedido.total }}</span>
                </div>
              </v-card-item>
            </v-card>
          </div>
        </div>
      </v-col>

      <!-- Sección 2: Lista de Platillos (más ancha) -->
      <v-col cols="7" class="px-2">
        <div class="d-flex flex-column h-100">
          <div class="px-4 pt-4">
            <div class="d-flex align-center mb-2">
              <h2 class="text-h6">Menú</h2>
              <v-spacer></v-spacer>
              <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Buscar platillo" single-line
                variant="outlined" hide-details density="compact" style="max-width: 300px"></v-text-field>
            </div>
          </div>

          <div class="flex-grow-1 overflow-y-auto px-2">
            <v-row>
              <v-col v-for="item in filteredItems" :key="item.id" cols="12" sm="6" lg="4">
                <v-card @click="addToOrder(item)" class="h-100" elevation="2" hover>
                  <v-img :src="item.imageUrl" height="180" cover class="align-end">
                    <v-card-title class="text-white bg-black bg-opacity-50 px-4 py-2">
                      {{ item.nombre }}
                    </v-card-title>
                  </v-img>
                  <v-card-text>
                    <div class="text-caption mb-1">{{ item.descripcion }}</div>
                    <div class="text-h6 font-weight-bold">${{ item.precio }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-col>

      <!-- Sección 3: Resumen de Orden -->
      <v-col cols="3" class="bg-grey-lighten-4 px-2">
        <div class="d-flex flex-column h-100">
          <div class="px-2 pt-2">
            <div class="d-flex align-center mb-2">
              <h2 class="text-h6">Orden Actual</h2>
              <v-spacer></v-spacer>
              <v-btn density="compact" variant="text" icon="mdi-account-plus"
                @click="dialogNuevoCliente = true"></v-btn>
            </div>

            <div class="d-flex gap-2 mb-2">
              <v-select v-model="formData.clienteId" :items="clientes" item-title="nombres" item-value="id"
                placeholder="Seleccionar cliente" density="compact" hide-details class="flex-grow-1">
                <template v-slot:prepend-inner>
                  <v-icon size="small">mdi-account</v-icon>
                </template>
              </v-select>

              <v-select v-model="formData.tipoPedidoId" :items="tPedidos" item-title="descripcion" item-value="id"
                placeholder="Tipo" density="compact" hide-details style="max-width: 150px;"></v-select>
            </div>
          </div>

          <div class="flex-grow-1 overflow-y-auto px-2">
            <v-list density="compact">
              <v-list-item v-for="(item, index) in orderItems" :key="index" class="mb-1">
                <v-list-item-title class="text-subtitle-2">
                  {{ item.nombre }} x{{ item.quantity }}
                </v-list-item-title>
                <v-list-item-subtitle class="d-flex justify-space-between">
                  <span>${{ item.precio }}</span>
                  <span>${{ item.precio * item.quantity }}</span>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>

          <div class="px-4 pb-4">
            <v-card flat class="bg-transparent">
              <v-card-text class="py-2">
                <div class="d-flex justify-space-between mb-1">
                  <span>Subtotal:</span>
                  <span>${{ subtotal }}</span>
                </div>
                <div class="d-flex justify-space-between mb-1">
                  <span>Descuento:</span>
                  <span>${{ discount }}</span>
                </div>
                <div class="d-flex justify-space-between text-h6">
                  <span>Total:</span>
                  <span>${{ total }}</span>
                </div>
              </v-card-text>
              <v-card-actions class="pa-0">
                <v-btn block color="success" size="large" @click="sendToKitchen">
                  Mandar a Cocina
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-dialog v-model="dialogNuevoCliente" max-width="500px">
      <v-card>
        <v-card-title>Nuevo Cliente</v-card-title>
        <v-card-text>
          <v-form ref="formNewClient" @submit.prevent="handleCreateClient">
            <v-row>
              <v-col cols="6">
                <v-text-field v-model="nuevoCliente.nombres" label="Nombre completo" placeholder="Ej. Marvin Ponce"
                  :rules="[
                    v => !!v || 'El nombre es requerido',
                    v => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v) || 'Solo se permiten letras',
                    v => v?.length >= 3 || 'El nombre debe tener al menos 3 caracteres'
                  ]">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="nuevoCliente.dni" placeholder="Ej. 10101190012345" label="N° de identidad"
                  :rules="[
                    v => !!v || 'El número de identidad es requerido',
                    v => /^\d+$/.test(v) || 'Solo se permiten números',
                    v => v?.length >= 13 || 'El número debe tener 13 dígitos',
                    v => v?.length <= 13 || 'El número debe tener 13 dígitos'
                  ]">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="nuevoCliente.telefono" placeholder="Ej. 99999999" label="Teléfono" :rules="[
                  v => !!v || 'El teléfono es requerido',
                  v => /^\d+$/.test(v) || 'Solo se permiten números',
                  v => v?.length >= 8 || 'El teléfono debe tener al menos 8 dígitos',
                  v => v?.length <= 8 || 'El teléfono debe tener 8 dígitos'
                ]">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="nuevoCliente.correo" placeholder="Ej. user@example.es" label="Correo electrónico"
                  :rules="[
                    v => !!v || 'El correo es requerido',
                    v => /.+@.+\..+/.test(v) || 'Ingrese un correo válido',
                    v => v?.length <= 50 || 'El correo no debe exceder 50 caracteres'
                  ]">
                </v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="dialogNuevoCliente = false">Cancelar</v-btn>
          <v-btn color="primary" @click="handleCreateClient">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
const searchPending = ref('')
const datos = ref([])
const tPedidos = ref([])
const pedidosPendientes = ref([])
const error = ref()
const isSnackbarVisible = ref(false)
const snackbarMessage = ref("")
const snackbarColor = ref("success")
const dialogNuevoCliente = ref(false)
const formNewClient = ref(null)
const clientes = ref([])

const orderItems = ref([])
const discount = ref(0)

const formData = ref({
  //valores de pedido
  clienteId: 1, // Por ahora hardcodeado, después se puede hacer dinámico
  colaboradorId: 2, // Por ahora hardcodeado, después se puede hacer dinámico
  tipoPedidoId: '',
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

const nuevoCliente = ref({
  nombres: '',
  correo: '',
  dni: '',
  telefono: '',
  estado: 1
})

const resetForm = () => {
  formData.value = {
    clienteId: 1,
    colaboradorId: 2,
    tipoPedidoId: '',
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

const resetFormCliente = () => {
  nuevoCliente.value = {
    nombres: '',
    correo: '',
    dni: '',
    telefono: '',
    estado: 1
  }
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

const filteredPendingOrders = computed(() => {
  if (!searchPending.value) return pedidosPendientes.value
  const searchTerm = searchPending.value.toLowerCase()
  return pedidosPendientes.value.filter(pedido =>
    pedido.numeroOrden.toLowerCase().includes(searchTerm) ||
    pedido.nombreCliente.toLowerCase().includes(searchTerm)
  )
})

const selectPendingOrder = async (pedido) => {
  // Por ahora solo mostraremos un mensaje
  snackbarColor.value = "info"
  snackbarMessage.value = `Seleccionaste la orden #${pedido.numeroOrden}`
  isSnackbarVisible.value = true
}

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
      resetForm()
      await refreshPendingOrders()
    } else {
      throw new Error(response.message)
    }
  } catch (e) {
    snackbarColor.value = "error"
    snackbarMessage.value = e.data.message || "Error al crear el pedido"
    isSnackbarVisible.value = true
  }
}

const handleCreateClient = async () => {
  const { valid } = await formNewClient.value?.validate()

  if (!valid) return

  try {
    const response = await $fetch(runtimeConfig.public.apiBase + "/cliente/caja", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      },
      body: nuevoCliente.value
    })

    if (response.success) {
      snackbarColor.value = "success"
      snackbarMessage.value = "Cliente creado exitosamente"
      isSnackbarVisible.value = true
      dialogNuevoCliente.value = false
      await getClientes()
      formData.value.clienteId = response.data.id
      resetFormCliente()
    }
  } catch (e) {
    snackbarColor.value = "error"
    snackbarMessage.value =  e.data.message || "Error al crear el cliente"
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
    snackbarMessage.value =  e.data.message || "Error al cargar los datos"
    isSnackbarVisible.value = true
  }
}

const getDataSelect = async () => {
  try {
    const getTipoPedido = await $fetch(runtimeConfig.public.apiBase + "/tipoPedido", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    })

    const getPedidoPendiente = await $fetch(runtimeConfig.public.apiBase + "/pedido", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    })


    tPedidos.value = getTipoPedido.data
    pedidosPendientes.value = getPedidoPendiente.data
  } catch (e) {
    error.value = e
    snackbarColor.value = "error"
    snackbarMessage.value =  e.data.message || "Error al cargar los datos"
    isSnackbarVisible.value = true

  }
}

const filtrarElementosActivos = (array) => array.filter(element => element.estado !== false)

const dataRefs = {
  tPedidos,
  clientes
}

Object.entries(dataRefs).forEach(([key, ref]) => {
  watch(ref, (nuevos, viejos) => {
    if (viejos.length === 0) {
      ref.value = filtrarElementosActivos(nuevos)
    }
  })
})

const refreshPendingOrders = async () => {
  try {
    const response = await $fetch(runtimeConfig.public.apiBase + "/pedido", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    });
    pedidosPendientes.value = response.data;
  } catch (e) {
    console.error('Error al actualizar pedidos pendientes:', e);
  }
}

const getClientes = async () => {
  try {
    const response = await $fetch(runtimeConfig.public.apiBase + "/cliente", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.apiKey,
        "Authorization": `Bearer ${token}`,
      }
    })

    if (response.success) {
      clientes.value = response.data
    }
  } catch (e) {
    snackbarColor.value = "error"
    snackbarMessage.value = "Error al cargar los clientes"
    isSnackbarVisible.value = true
  }
}

await getDataSelect()

onMounted(() => {
  getData()
  getClientes()
})
</script>

<style scoped>
.v-container {
  max-width: 100%;
}
</style>